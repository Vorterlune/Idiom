import type { ReactNode } from 'react';
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
