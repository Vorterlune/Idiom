import type { ReactNode } from 'react';

import type {
  SettingsLinkProps,
  SettingsPickerProps,
  SettingsRowProps,
  SettingsSectionProps,
  SettingsToggleProps,
  SettingsValueProps,
} from '../types';

function unsupported(): never {
  throw new Error(
    '[Idiom] Settings supports iOS and Android. Run the showcase in a native development build.',
  );
}

export const ScreenLayout: (props: { children: ReactNode }) => ReactNode = unsupported;
export const SettingsSection: (props: SettingsSectionProps) => ReactNode = unsupported;
export const SettingsRow: (props: SettingsRowProps) => ReactNode = unsupported;
export const SettingsLink: (props: SettingsLinkProps) => ReactNode = unsupported;
export const SettingsValue: (props: SettingsValueProps) => ReactNode = unsupported;
export const SettingsToggle: (props: SettingsToggleProps) => ReactNode = unsupported;
export const SettingsPicker: <T extends string>(props: SettingsPickerProps<T>) => ReactNode =
  unsupported;
