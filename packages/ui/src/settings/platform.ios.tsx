import {
  Button,
  Form,
  HStack,
  Menu,
  Section,
  Spacer,
  Text,
  Toggle,
  VStack,
} from '@expo/ui/swift-ui';
import {
  accessibilityElement,
  accessibilityAddTraits,
  accessibilityHint,
  accessibilityLabel,
  accessibilityValue,
  buttonStyle,
  contentShape,
  disabled,
  font,
  foregroundStyle,
  frame,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import type { ReactNode } from 'react';

import { Chevron, SemanticSymbol } from '../internal/icons';
import { NativeSlot, useContentWidth } from '../internal/native';
import type {
  SettingsCommonProps,
  SettingsLinkProps,
  SettingsPickerProps,
  SettingsRowProps,
  SettingsSectionProps,
  SettingsToggleProps,
  SettingsValueProps,
} from '../types';
import { settingLabel, usePickerBehavior } from './behavior';

export function ScreenLayout({ children }: { children: ReactNode }) {
  return <Form>{children}</Form>;
}

export function SettingsSection({ children, title, footer, testID }: SettingsSectionProps) {
  return (
    <Section
      {...(title ? { title } : {})}
      {...(footer ? { footer: <Text>{footer}</Text> } : {})}
      {...(testID ? { testID } : {})}
    >
      {children}
    </Section>
  );
}

function rowModifiers(props: SettingsCommonProps) {
  return [
    frame({ minHeight: 44 }),
    disabled(Boolean(props.disabled)),
    accessibilityLabel(settingLabel(props)),
    ...(props.accessibilityHint ? [accessibilityHint(props.accessibilityHint)] : []),
  ];
}

function RowLabel(props: SettingsCommonProps) {
  return (
    <HStack spacing={12}>
      {props.icon ? <SemanticSymbol name={props.icon} /> : null}
      <VStack alignment="leading" spacing={3}>
        <Text modifiers={[font({ textStyle: 'body' })]}>{props.label}</Text>
        {props.description ? (
          <Text
            modifiers={[
              font({ textStyle: 'subheadline' }),
              foregroundStyle({ type: 'color', color: 'secondaryLabel' }),
            ]}
          >
            {props.description}
          </Text>
        ) : null}
      </VStack>
    </HStack>
  );
}

function RowContent({ props, accessory }: { props: SettingsCommonProps; accessory?: ReactNode }) {
  return (
    <HStack spacing={12} modifiers={[frame({ minHeight: 44 }), contentShape(shapes.rectangle())]}>
      <RowLabel {...props} />
      <Spacer />
      {accessory}
    </HStack>
  );
}

export function SettingsRow(props: SettingsRowProps) {
  const content = (
    <RowContent
      props={props}
      accessory={props.trailing == null ? null : <NativeSlot>{props.trailing}</NativeSlot>}
    />
  );
  const modifiers = rowModifiers(props);
  if (props.onPress) {
    return (
      <Button
        {...(props.testID ? { testID: props.testID } : {})}
        modifiers={[buttonStyle('plain'), ...modifiers]}
        onPress={() => {
          if (!props.disabled) props.onPress?.();
        }}
      >
        {content}
      </Button>
    );
  }
  return (
    <HStack
      {...(props.testID ? { testID: props.testID } : {})}
      modifiers={[...modifiers, accessibilityElement('combine')]}
    >
      {content}
    </HStack>
  );
}

export function SettingsLink(props: SettingsLinkProps) {
  return (
    <Button
      {...(props.testID ? { testID: props.testID } : {})}
      modifiers={[buttonStyle('plain'), ...rowModifiers(props)]}
      onPress={() => {
        if (!props.disabled) props.onPress();
      }}
    >
      <RowContent props={props} accessory={<Chevron />} />
    </Button>
  );
}

export function SettingsValue(props: SettingsValueProps) {
  const width = useContentWidth();
  return (
    <HStack
      {...(props.testID ? { testID: props.testID } : {})}
      modifiers={[
        ...rowModifiers(props),
        accessibilityElement('combine'),
        accessibilityValue(props.value),
      ]}
    >
      <RowContent
        props={props}
        accessory={
          <Text
            modifiers={[
              frame({ maxWidth: Math.min(280, width * 0.48), alignment: 'trailing' }),
              foregroundStyle({ type: 'color', color: 'secondaryLabel' }),
            ]}
          >
            {props.value}
          </Text>
        }
      />
    </HStack>
  );
}

export function SettingsToggle(props: SettingsToggleProps) {
  return (
    <Toggle
      isOn={props.value}
      onIsOnChange={(value) => {
        if (!props.disabled && value !== props.value) props.onValueChange(value);
      }}
      modifiers={rowModifiers(props)}
      {...(props.testID ? { testID: props.testID } : {})}
    >
      <RowLabel {...props} />
    </Toggle>
  );
}

export function SettingsPicker<T extends string>(props: SettingsPickerProps<T>) {
  const behavior = usePickerBehavior(props);
  const width = useContentWidth();
  return (
    <Menu
      label={
        <RowContent
          props={props}
          accessory={
            <Text
              modifiers={[
                frame({ maxWidth: Math.min(280, width * 0.48), alignment: 'trailing' }),
                foregroundStyle({ type: 'color', color: 'secondaryLabel' }),
              ]}
            >
              {behavior.selectedLabel}
            </Text>
          }
        />
      }
      modifiers={[
        ...rowModifiers(props),
        disabled(behavior.disabled),
        accessibilityValue(behavior.selectedLabel),
      ]}
      {...(props.testID ? { testID: props.testID } : {})}
    >
      {props.options.map((option, index) => (
        <Button
          key={`${index}:${option.value}`}
          label={option.label}
          {...(option.value === props.value ? { systemImage: 'checkmark' as const } : {})}
          modifiers={[
            disabled(behavior.disabled),
            ...(option.value === props.value ? [accessibilityAddTraits(['isSelected'])] : []),
          ]}
          onPress={() => behavior.select(option.value)}
          {...(props.testID ? { testID: `${props.testID}.option.${option.value}` } : {})}
        />
      ))}
    </Menu>
  );
}
