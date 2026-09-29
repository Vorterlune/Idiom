import { SettingsScreen } from './settings/Screen';
import {
  SettingsLink,
  SettingsPicker,
  SettingsRow,
  SettingsSection,
  SettingsToggle,
  SettingsValue,
} from './settings/platform';

export const Settings = {
  Screen: SettingsScreen,
  Section: SettingsSection,
  Row: SettingsRow,
  Toggle: SettingsToggle,
  Link: SettingsLink,
  Value: SettingsValue,
  Picker: SettingsPicker,
};

export { EmptyState } from './EmptyState';
export { SearchBar } from './SearchBar';
export { IdiomProvider } from './provider';
export type {
  EmptyStateProps,
  IdiomProviderProps,
  SearchBarProps,
  SemanticIcon,
  SettingsCommonProps,
  SettingsLinkProps,
  SettingsPickerOption,
  SettingsPickerProps,
  SettingsRowProps,
  SettingsScreenProps,
  SettingsSectionProps,
  SettingsToggleProps,
  SettingsValueProps,
} from './types';
