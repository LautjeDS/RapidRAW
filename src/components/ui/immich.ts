export const IMMICH_EXPORT_AND_UPLOAD_INVOKE = 'export_and_upload_to_immich';

export interface ImmichAppSettings {
  immichUrl?: string;
  immichApiKey?: string;
  immichUploadSuffix?: string;
}

export const hasImmichConfig = (settings: ImmichAppSettings | null | undefined): boolean =>
  !!settings?.immichUrl?.trim() && !!settings?.immichApiKey?.trim();
