import type { ReactNode } from 'react';
import { createContext, createElement, useContext, useState } from 'react';
import { Text as RNText, View } from 'react-native';
import type { TestModifier } from './native-modifier';
import { swiftAccessibility } from './native-modifier';

type Props = {
  children?: ReactNode;
  modifiers?: readonly TestModifier[];
  label?: ReactNode;
  title?: string;
  footer?: ReactNode;
  header?: ReactNode;
  isOn?: boolean;
  onPress?: () => void;
  [key: string]: unknown;
};

const DismissMenuContext = createContext<(() => void) | undefined>(undefined);

const container = (name: string) => {
  function NativeContainer(props: Props) {
    return createElement(
      View,
      { ...props, ...swiftAccessibility(props.modifiers) },
      props.children,
    );
  }
  NativeContainer.displayName = name;
  return NativeContainer;
};

export const Host = container('SwiftUI.Host');
export const RNHostView = container('SwiftUI.RNHostView');
export const Form = container('SwiftUI.Form');
export const HStack = container('SwiftUI.HStack');
export const VStack = container('SwiftUI.VStack');
export const Spacer = container('SwiftUI.Spacer');
export const Image = container('SwiftUI.Image');

export function Text(props: Props) {
  return (
    <RNText {...props} {...swiftAccessibility(props.modifiers)}>
      {props.children}
    </RNText>
  );
}

export function Section(props: Props) {
  return (
    <View>
      {props.title ? <RNText>{props.title}</RNText> : null}
      {props.header}
      {props.children}
      {typeof props.footer === 'string' ? <RNText>{props.footer}</RNText> : props.footer}
    </View>
  );
}

export function Button(props: Props) {
  const dismiss = useContext(DismissMenuContext);
  return (
    <View
      {...props}
      accessible
      accessibilityRole="button"
      {...swiftAccessibility(props.modifiers)}
      {...{
        onPress: () => {
          props.onPress?.();
          dismiss?.();
        },
      }}
    >
      {typeof props.label === 'string' ? <RNText>{props.label}</RNText> : props.label}
      {props.children}
    </View>
  );
}

export function Toggle(props: Props) {
  const accessibility = swiftAccessibility(props.modifiers);
  return (
    <View
      {...props}
      accessible
      accessibilityRole="switch"
      {...accessibility}
      accessibilityState={{ ...accessibility.accessibilityState, checked: props.isOn ?? false }}
    >
      {typeof props.label === 'string' ? <RNText>{props.label}</RNText> : props.label}
      {props.children}
    </View>
  );
}

export function Menu(props: Props) {
  const [expanded, setExpanded] = useState(false);
  const accessibility = swiftAccessibility(props.modifiers);
  return (
    <View>
      <View
        accessible
        accessibilityRole="button"
        {...props}
        {...accessibility}
        {...{
          onPress: () => {
            if (!accessibility.accessibilityState?.disabled) setExpanded(true);
          },
        }}
      >
        {typeof props.label === 'string' ? <RNText>{props.label}</RNText> : props.label}
      </View>
      {expanded ? (
        <View accessible accessibilityRole="menu" onAccessibilityEscape={() => setExpanded(false)}>
          <DismissMenuContext value={() => setExpanded(false)}>{props.children}</DismissMenuContext>
        </View>
      ) : null}
    </View>
  );
}
