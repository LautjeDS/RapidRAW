import Input from '../ui/Input';
import Text from '../ui/Text';
import { TextVariants } from '../../types/typography';

interface ImmichSettingsSectionProps {
  appSettings: any;
  immichApiKey: string;
  immichUploadSuffix: string;
  immichUrl: string;
  onSettingsChange: (settings: any) => void;
  setImmichApiKey: (value: string) => void;
  setImmichUploadSuffix: (value: string) => void;
  setImmichUrl: (value: string) => void;
}

export default function ImmichSettingsSection({
  appSettings,
  immichApiKey,
  immichUploadSuffix,
  immichUrl,
  onSettingsChange,
  setImmichApiKey,
  setImmichUploadSuffix,
  setImmichUrl,
}: ImmichSettingsSectionProps) {
  return (
    <div>
      <Text variant={TextVariants.heading} className="block mb-2">
        Immich
      </Text>
      <div className="space-y-3">
        <Input
          onChange={(e: any) => {
            const nextValue = e.target.value;
            setImmichUrl(nextValue);
            onSettingsChange({ ...appSettings, immichUrl: nextValue });
          }}
          placeholder="Instance URL"
          type="text"
          value={immichUrl}
        />
        <Input
          onChange={(e: any) => {
            const nextValue = e.target.value;
            setImmichApiKey(nextValue);
            onSettingsChange({ ...appSettings, immichApiKey: nextValue });
          }}
          placeholder="API Key"
          type="password"
          value={immichApiKey}
        />
        <Input
          onChange={(e: any) => {
            const nextValue = e.target.value;
            setImmichUploadSuffix(nextValue);
            onSettingsChange({
              ...appSettings,
              immichUploadSuffix: nextValue,
            });
          }}
          placeholder='Suffix of uploaded files (default: "~RapidRaw")'
          type="text"
          value={immichUploadSuffix}
        />
      </div>
      <Text variant={TextVariants.small} className="mt-2">
        Upload exported images to a local Immich instance.
      </Text>
    </div>
  );
}
