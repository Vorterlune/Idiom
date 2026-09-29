import type { ReactNode } from 'react';
import { createElement } from 'react';
import { Text as RNText, View } from 'react-native';
import type { TestModifier } from './native-modifier';

type Props = { children?: ReactNode; text?: string; [key: string]: unknown };

const container = (name: string) => {
  function NativeContainer(props: Props) {
    return createElement(View, props, props.children);
  }
  NativeContainer.displayName = name;
  return NativeContainer;
};

const Slot = container('Compose.Slot');
export const Host = container('Compose.Host');
export const RNHostView = container('Compose.RNHostView');
export const Row = container('Compose.Row');
export const Column = container('Compose.Column');
export const Box = container('Compose.Box');
export const Spacer = container('Compose.Spacer');
export const Switch = container('Compose.Switch');
export const RadioButton = container('Compose.RadioButton');
export const HorizontalDivider = container('Compose.HorizontalDivider');
export const Icon = container('Compose.Icon');

export function useMaterialColors() {
  return {
    surface: '#fffbfe',
    surfaceContainer: '#f3edf7',
    onSurface: '#1c1b1f',
    onSurfaceVariant: '#49454f',
    outlineVariant: '#cac4d0',
    primary: '#6750a4',
  };
}

export const ListItem = Object.assign(container('Compose.ListItem'), {
  HeadlineContent: Slot,
  SupportingContent: Slot,
  LeadingContent: Slot,
  TrailingContent: Slot,
  OverlineContent: Slot,
});

export const ExposedDropdownMenuBox = container('Compose.ExposedDropdownMenuBox');

export function ExposedDropdownMenu(props: Props & { expanded: boolean }) {
  if (!props.expanded) return null;
  return (
    <View {...props} accessible accessibilityRole="menu">
      {props.children}
    </View>
  );
}

function MenuItem(props: Props & { modifiers?: readonly TestModifier[]; enabled?: boolean }) {
  const testID = props.modifiers?.find((item) => item.name === 'testID')?.args[0];
  return (
    <View
      {...props}
      accessible
      accessibilityRole="menuitem"
      accessibilityState={{ disabled: props.enabled === false }}
      {...(typeof testID === 'string' ? { testID } : {})}
    >
      {props.children}
    </View>
  );
}

export const DropdownMenuItem = Object.assign(MenuItem, { Text: Slot, TrailingIcon: Slot });

export function Text(props: Props) {
  return <RNText {...props}>{props.children ?? props.text}</RNText>;
}
