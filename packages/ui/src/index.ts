import { SettingsScreen } from './settings/Screen';
import { FormScreen } from './forms/Screen';
import { FormSection } from './forms/Section';
import { FormTextField } from './forms/TextField';
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

export const Form = {
  Screen: FormScreen,
  Section: FormSection,
  TextField: FormTextField,
};

export { EmptyState } from './EmptyState';
export { SearchBar } from './SearchBar';
export { IdiomProvider } from './provider';
export { ConfirmationDialog } from './confirmation/ConfirmationDialog';
export { ActionSheet } from './actions/ActionSheet';
export type {
  ActionSheetAction,
  ActionSheetProps,
  ConfirmationDialogProps,
  FormScreenProps,
  FormSectionProps,
  FormTextFieldProps,
  FormTextFieldRef,
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
