use std::fs;
use std::path::Path;
use std::sync::Arc;
use std::time::Duration;

use image::DynamicImage;
use serde_json::Value;
use tauri::{Emitter, Manager};

use crate::app_settings::load_settings;
use crate::cache_utils::calculate_full_job_hash;
use crate::export_processing::{ExportSettings, encode_image_to_bytes, process_image_for_export};
use crate::file_management::{parse_virtual_path, read_file_mapped};
use crate::formats::is_raw_file;
use crate::image_loader::{composite_patches_on_image, load_and_composite};
use crate::image_processing::get_or_init_gpu_context;
use crate::AppState;

fn immich_mime_for_format(output_format: &str) -> Option<&'static str> {
    match output_format.to_lowercase().as_str() {
        "jpg" | "jpeg" => Some("image/jpeg"),
        "png" => Some("image/png"),
        "webp" => Some("image/webp"),
        "jxl" => Some("image/jxl"),
        "tiff" | "tif" => Some("image/tiff"),
        _ => None,
    }
}

fn build_immich_assets_url(raw_url: &str) -> Result<String, String> {
    let mut url = reqwest::Url::parse(raw_url)
        .map_err(|e| format!("Invalid Immich URL '{}': {}", raw_url, e))?;

    let mut path = url.path().trim_end_matches('/').to_string();
    if path.is_empty() {
        path = "/api".to_string();
    } else if !path.ends_with("/api") {
        path = format!("{}/api", path);
    }

    url.set_path(&format!("{}/assets", path));
    url.set_query(None);
    url.set_fragment(None);
    Ok(url.to_string())
}

#[tauri::command]
pub async fn export_and_upload_to_immich(
    original_path: String,
    js_adjustments: Value,
    export_settings: ExportSettings,
    output_format: String,
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    if state.export_task_handle.lock().unwrap().is_some() {
        return Err("An export is already in progress.".to_string());
    }

    let task = tokio::spawn(async move {
        let state = app_handle.state::<AppState>();
        let app_handle_for_settings = app_handle.clone();

        let processing_result: Result<(), String> = (async {
            let context = Arc::new(get_or_init_gpu_context(&state, &app_handle)?);
            let (source_path, _) = parse_virtual_path(&original_path);
            let source_path_str = source_path.to_string_lossy().to_string();
            let output_format = output_format.to_lowercase();

            if output_format == "cube" {
                return Err("CUBE LUT export is not supported for Immich uploads.".to_string());
            }

            let output_mime = immich_mime_for_format(&output_format)
                .ok_or_else(|| format!("Unsupported upload format for Immich: {}", output_format))?;

            let settings = load_settings(app_handle_for_settings).unwrap_or_default();
            let immich_url = settings
                .immich_url
                .as_deref()
                .map(str::trim)
                .filter(|s| !s.is_empty())
                .ok_or("Immich URL not configured")?
                .to_string();
            let immich_api_key = settings
                .immich_api_key
                .as_deref()
                .map(str::trim)
                .filter(|s| !s.is_empty())
                .ok_or("Immich API key not configured")?
                .to_string();
            let immich_upload_suffix = settings
                .immich_upload_suffix
                .as_deref()
                .map(str::trim)
                .filter(|s| !s.is_empty())
                .unwrap_or("~RapidRaw")
                .to_string();
            let highlight_compression = settings.raw_highlight_compression.unwrap_or(2.5);
            let linear_mode = settings.linear_raw_mode;

            let original_image_data: DynamicImage = match read_file_mapped(Path::new(&source_path_str)) {
                Ok(mmap) => load_and_composite(
                    &mmap,
                    &source_path_str,
                    &js_adjustments,
                    false,
                    highlight_compression,
                    linear_mode.clone(),
                    None,
                )
                .map_err(|e| format!("Failed to load image from mmap: {}", e))?,
                Err(e) => {
                    log::warn!(
                        "Failed to memory-map file '{}': {}. Falling back to standard read.",
                        source_path_str,
                        e
                    );
                    let bytes = fs::read(&source_path_str)
                        .map_err(|io_err| format!("Fallback read failed for {}: {}", source_path_str, io_err))?;
                    load_and_composite(
                        &bytes,
                        &source_path_str,
                        &js_adjustments,
                        false,
                        highlight_compression,
                        linear_mode,
                        None,
                    )
                    .map_err(|e| format!("Failed to load image from bytes: {}", e))?
                }
            };
            let is_raw = is_raw_file(&source_path_str);

            let base_image = composite_patches_on_image(&original_image_data, &js_adjustments)
                .map_err(|e| format!("Failed to composite AI patches for export: {}", e))?;

            let mut main_export_adjustments = js_adjustments.clone();
            if export_settings.export_masks
                && let Some(obj) = main_export_adjustments.as_object_mut()
            {
                obj.insert("masks".to_string(), serde_json::json!([]));
            }

            let final_image = process_image_for_export(
                &source_path_str,
                &base_image,
                &main_export_adjustments,
                &export_settings,
                &context,
                &state,
                is_raw,
                &app_handle,
            )?;

            let mut image_bytes =
                encode_image_to_bytes(&final_image, &output_format, export_settings.jpeg_quality)?;

            crate::exif_processing::write_image_with_metadata(
                &mut image_bytes,
                &source_path_str,
                &output_format,
                export_settings.keep_metadata,
                export_settings.strip_gps,
            )?;

            let client = reqwest::Client::builder()
                .connect_timeout(Duration::from_secs(10))
                .timeout(Duration::from_secs(90))
                .build()
                .map_err(|e| format!("Failed to build Immich HTTP client: {}", e))?;
            let source_stem = source_path
                .file_stem()
                .and_then(|s| s.to_str())
                .filter(|s| !s.is_empty())
                .unwrap_or("image");
            let upload_filename =
                format!("{}{}.{}", source_stem, immich_upload_suffix, output_format);
            let (file_created_at, file_modified_at) = match fs::metadata(&source_path) {
                Ok(metadata) => {
                    let created_time = metadata
                        .created()
                        .or_else(|_| metadata.modified())
                        .unwrap_or_else(|_| std::time::SystemTime::now());
                    let modified_time = metadata
                        .modified()
                        .or_else(|_| metadata.created())
                        .unwrap_or(created_time);

                    (
                        chrono::DateTime::<chrono::Utc>::from(created_time).to_rfc3339(),
                        chrono::DateTime::<chrono::Utc>::from(modified_time).to_rfc3339(),
                    )
                }
                Err(_) => {
                    let now = chrono::Utc::now().to_rfc3339();
                    (now.clone(), now)
                }
            };

            let device_id = "rapidraw".to_string();
            let upload_hash = calculate_full_job_hash(&original_path, &js_adjustments);
            let device_asset_id = format!(
                "rapidraw:{}:{}:{}:{}",
                original_path, file_modified_at, output_format, upload_hash
            );

            let asset_part = reqwest::multipart::Part::bytes(image_bytes)
                .file_name(upload_filename.clone())
                .mime_str(output_mime)
                .map_err(|e| format!("Failed to build upload multipart: {}", e))?;

            let form = reqwest::multipart::Form::new()
                .part("assetData", asset_part)
                .text("deviceId", device_id)
                .text("deviceAssetId", device_asset_id)
                .text("fileCreatedAt", file_created_at)
                .text("fileModifiedAt", file_modified_at)
                .text("filename", upload_filename);

            let target = build_immich_assets_url(&immich_url)?;

            let resp = client
                .post(&target)
                .header("x-api-key", immich_api_key)
                .multipart(form)
                .send()
                .await
                .map_err(|e| format!("Failed to upload to Immich: {}", e))?;

            if !resp.status().is_success() {
                let status = resp.status();
                let txt = resp.text().await.unwrap_or_default();
                log::error!("Immich upload failed {} - {}", status, txt);
                return Err(format!("Immich upload failed: {} - {}", status, txt));
            }

            Ok(())
        })
        .await;

        if let Err(e) = processing_result {
            log::error!("Immich upload failed: {}", e);
            let _ = app_handle.emit("export-error", e);
        } else {
            let _ = app_handle.emit("export-complete", ());
        }

        *app_handle
            .state::<AppState>()
            .export_task_handle
            .lock()
            .unwrap() = None;
    });

    *state.export_task_handle.lock().unwrap() = Some(task);

    Ok(())
}
