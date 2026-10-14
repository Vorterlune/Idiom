import type { ReactNode, Ref } from 'react';
import type { Edge } from 'react-native-safe-area-context';

export type SemanticIcon =
  'person' | 'notifications' | 'appearance' | 'sound' | 'privacy' | 'info' | 'document' | 'search';

export interface IdiomProviderProps {
  children: ReactNode;
  appearance?: 'system' | 'light' | 'dark';
  accentColor?: string;
}

export interface SettingsScreenProps {
  children: ReactNode;
  title?: string;
  /** React Native content, displayed above the scrolling settings. */
  header?: ReactNode;
  /** Exclude edges already handled by a navigation container. */
  safeAreaEdges?: readonly Edge[];
  testID?: string;
}

export interface SettingsSectionProps {
  children: ReactNode;
  title?: string;
  footer?: string;
  testID?: string;
}

export interface SettingsCommonProps {
  label: string;
  description?: string;
  icon?: SemanticIcon;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export interface SettingsRowProps extends SettingsCommonProps {
  /** Display-only React Native content. Interactive accessories use their own settings component. */
  trailing?: ReactNode;
  onPress?: () => void;
}

export interface SettingsLinkProps extends SettingsCommonProps {
  onPress: () => void;
}

export interface SettingsValueProps extends SettingsCommonProps {
  value: string;
}

export interface SettingsToggleProps extends SettingsCommonProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export interface SettingsPickerOption<T extends string = string> {
  label: string;
  value: T;
}

export interface SettingsPickerProps<T extends string = string> extends SettingsCommonProps {
  value: T;
  options: readonly SettingsPickerOption<T>[];
  onValueChange: (value: T) => void;
}

export interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onSubmit?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: SemanticIcon;
  action?: { label: string; onPress: () => void };
  testID?: string;
}

export interface FormScreenProps {
  children: ReactNode;
  submitLabel: string;
  /** The application validates, sets submitting, and handles any async work. */
  onSubmit: () => void;
  title?: string;
  safeAreaEdges?: readonly Edge[];
  /** Disables editing and all submission requests. */
  submitting?: boolean;
  /** Disables submission without disabling editing. */
  submitDisabled?: boolean;
  error?: string;
  testID?: string;
}

export interface FormSectionProps {
  children: ReactNode;
  title?: string;
  footer?: string;
  testID?: string;
}

export interface FormTextFieldRef {
  focus: () => void;
  blur: () => void;
}

export interface FormTextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  kind?: 'text' | 'name' | 'email';
  description?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  onBlur?: () => void;
  /** Overrides the default Done submission; use with Next to focus another field. */
  onSubmitEditing?: () => void;
  returnKeyType?: 'next' | 'done';
  ref?: Ref<FormTextFieldRef>;
}

export interface ConfirmationDialogProps {
  open: boolean;
  /** Accept user closure by setting open to false. A new false-to-true transition reopens. */
  onOpenChange: (open: boolean) => void;
  title: string;
  confirmLabel: string;
  /** Runs once after requesting closure. The application handles any async work. */
  onConfirm: () => void;
  message?: string;
  cancelLabel?: string;
  destructive?: boolean;
  testID?: string;
}
