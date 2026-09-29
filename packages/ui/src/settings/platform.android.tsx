import { Column, RNHostView, ScrollView } from '@expo/ui';
import {
  DropdownMenuItem,
  ExposedDropdownMenu,
  ExposedDropdownMenuBox,
  ListItem,
  Switch,
  Text,
} from '@expo/ui/jetpack-compose';
import {
  fillMaxWidth,
  menuAnchor,
  padding,
  testID as nativeTestID,
  width as nativeWidth,
} from '@expo/ui/jetpack-compose/modifiers';
import { useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type AccessibilityRole,
  type AccessibilityState,
} from 'react-native';

import { useColors } from '../internal/colors';
import { Chevron, SelectionMark, SemanticSymbol } from '../internal/icons';
import { NativeHost, NativeSlot, useContentWidth } from '../internal/native';
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
  return (
    <ScrollView modifiers={[fillMaxWidth()]}>
      <Column spacing={24} modifiers={[fillMaxWidth(), padding(16, 8, 16, 24)]}>
        {children}
      </Column>
    </ScrollView>
  );
}

export function SettingsSection({ children, title, footer, testID }: SettingsSectionProps) {
  const colors = useColors();
  return (
    <Column spacing={8} modifiers={[fillMaxWidth(), ...(testID ? [nativeTestID(testID)] : [])]}>
      {title ? (
        <Text
          color={colors.accent}
          style={{ typography: 'titleSmall' }}
          modifiers={[padding(16, 8, 16, 4)]}
        >
          {title}
        </Text>
      ) : null}
      <Column spacing={2} modifiers={[fillMaxWidth()]}>
        {children}
      </Column>
      {footer ? (
        <Text
          color={colors.secondary}
          style={{ typography: 'bodySmall' }}
          modifiers={[padding(16, 4, 16, 0)]}
        >
          {footer}
        </Text>
      ) : null}
    </Column>
  );
}

interface AndroidRowProps {
  setting: SettingsCommonProps;
  accessory?: ReactNode;
  onPress?: () => void;
  role?: AccessibilityRole;
  state?: AccessibilityState;
  value?: string;
  menuAnchor?: boolean;
}

// Expo's Compose semantics API cannot express custom labels or disabled row state yet.
// One RN accessibility/event boundary owns the row; the native visual subtree is inert.
function AndroidRow({
  setting,
  accessory,
  onPress,
  role,
  state,
  value,
  menuAnchor: anchor = false,
}: AndroidRowProps) {
  const colors = useColors();
  const width = useContentWidth();
  const disabled = Boolean(setting.disabled);
  return (
    <RNHostView matchContents {...(anchor ? { modifiers: [menuAnchor(undefined, false)] } : {})}>
      <Pressable
        accessible
        accessibilityLabel={settingLabel(setting)}
        {...(setting.accessibilityHint ? { accessibilityHint: setting.accessibilityHint } : {})}
        accessibilityRole={role ?? (onPress ? 'button' : 'text')}
        accessibilityState={{ ...state, disabled }}
        {...(value === undefined ? {} : { accessibilityValue: { text: value } })}
        {...(setting.testID ? { testID: setting.testID } : {})}
        disabled={disabled}
        {...(onPress
          ? {
              onPress: () => {
                if (!disabled) onPress();
              },
            }
          : {})}
        android_ripple={{ color: colors.separator, foreground: true }}
        style={[
          styles.row,
          { width, backgroundColor: colors.surface, opacity: disabled ? 0.5 : 1 },
        ]}
      >
        <View
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <NativeHost decorative style={{ width }}>
            <ListItem colors={{ containerColor: colors.surface }} modifiers={[fillMaxWidth()]}>
              <ListItem.HeadlineContent>
                <Text>{setting.label}</Text>
              </ListItem.HeadlineContent>
              {setting.description ? (
                <ListItem.SupportingContent>
                  <Text>{setting.description}</Text>
                </ListItem.SupportingContent>
              ) : null}
              {setting.icon ? (
                <ListItem.LeadingContent>
                  <SemanticSymbol name={setting.icon} color={colors.secondary} />
                </ListItem.LeadingContent>
              ) : null}
              {accessory == null ? null : (
                <ListItem.TrailingContent>{accessory}</ListItem.TrailingContent>
              )}
            </ListItem>
          </NativeHost>
        </View>
      </Pressable>
    </RNHostView>
  );
}

export function SettingsRow(props: SettingsRowProps) {
  return (
    <AndroidRow
      setting={props}
      {...(props.onPress ? { onPress: props.onPress } : {})}
      accessory={props.trailing == null ? null : <NativeSlot>{props.trailing}</NativeSlot>}
    />
  );
}

export function SettingsLink(props: SettingsLinkProps) {
  return <AndroidRow setting={props} onPress={props.onPress} accessory={<Chevron />} />;
}

export function SettingsValue(props: SettingsValueProps) {
  const colors = useColors();
  const width = useContentWidth();
  return (
    <AndroidRow
      setting={props}
      value={props.value}
      accessory={
        <Text
          color={colors.secondary}
          style={{ textAlign: 'end' }}
          modifiers={[nativeWidth(Math.min(240, width * 0.45))]}
        >
          {props.value}
        </Text>
      }
    />
  );
}

export function SettingsToggle(props: SettingsToggleProps) {
  return (
    <AndroidRow
      setting={props}
      role="switch"
      state={{ checked: props.value }}
      onPress={() => props.onValueChange(!props.value)}
      accessory={<Switch value={props.value} enabled={!props.disabled} />}
    />
  );
}

export function SettingsPicker<T extends string>(props: SettingsPickerProps<T>) {
  const behavior = usePickerBehavior(props);
  const [expanded, setExpanded] = useState(false);
  const colors = useColors();
  const width = useContentWidth();
  if (behavior.disabled && expanded) setExpanded(false);
  return (
    <ExposedDropdownMenuBox expanded={expanded && !behavior.disabled}>
      <AndroidRow
        setting={{ ...props, disabled: behavior.disabled }}
        menuAnchor
        role="button"
        state={{ expanded: expanded && !behavior.disabled }}
        value={behavior.selectedLabel}
        onPress={() => setExpanded(true)}
        accessory={
          <Text
            color={colors.secondary}
            style={{ textAlign: 'end' }}
            modifiers={[nativeWidth(Math.min(240, width * 0.45))]}
          >
            {behavior.selectedLabel}
          </Text>
        }
      />
      <ExposedDropdownMenu
        expanded={expanded && !behavior.disabled}
        onDismissRequest={() => setExpanded(false)}
      >
        {props.options.map((option, index) => (
          <DropdownMenuItem
            key={`${index}:${option.value}`}
            enabled={!behavior.disabled}
            onClick={() => {
              behavior.select(option.value);
              setExpanded(false);
            }}
            modifiers={props.testID ? [nativeTestID(`${props.testID}.option.${option.value}`)] : []}
          >
            <DropdownMenuItem.Text>
              <Text>{option.label}</Text>
            </DropdownMenuItem.Text>
            {option.value === props.value ? (
              <DropdownMenuItem.TrailingIcon>
                <SelectionMark />
              </DropdownMenuItem.TrailingIcon>
            ) : null}
          </DropdownMenuItem>
        ))}
      </ExposedDropdownMenu>
    </ExposedDropdownMenuBox>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 48, overflow: 'hidden', borderRadius: 12 },
});
