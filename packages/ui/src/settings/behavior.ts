import { useEffect } from 'react';

import type { SettingsCommonProps, SettingsPickerProps } from '../types';

export function settingLabel(props: SettingsCommonProps): string {
  return props.accessibilityLabel ?? [props.label, props.description].filter(Boolean).join('. ');
}

export function usePickerBehavior<T extends string>(props: SettingsPickerProps<T>) {
  const values = new Set(props.options.map((option) => option.value));
  const problem =
    props.options.length === 0
      ? 'options must contain at least one item'
      : values.size !== props.options.length
        ? 'option values must be unique'
        : !values.has(props.value)
          ? 'value must match an option'
          : undefined;
  useEffect(() => {
    if (__DEV__ && problem) console.warn(`[Idiom] Settings.Picker "${props.label}": ${problem}.`);
  }, [problem, props.label]);
  return {
    disabled: Boolean(props.disabled || problem),
    selectedLabel:
      props.options.find((option) => option.value === props.value)?.label ?? props.value,
    select(value: T) {
      if (!props.disabled && !problem && values.has(value) && value !== props.value) {
        props.onValueChange(value);
      }
    },
  };
}
