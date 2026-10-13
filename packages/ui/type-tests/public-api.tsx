import { createRef } from 'react';

import {
  Settings,
  SearchBar,
  EmptyState,
  IdiomProvider,
  Form,
  type FormScreenProps,
  type FormSectionProps,
  type FormTextFieldProps,
  type FormTextFieldRef,
} from '../src';

type Appearance = 'system' | 'light' | 'dark';

const options = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
] as const;

export const publicApiExamples = (
  <IdiomProvider appearance="system" accentColor="#3456ab">
    <Settings.Screen
      title="Settings"
      safeAreaEdges={['left', 'right', 'bottom']}
      header={<SearchBar value="" onChangeText={() => {}} onSubmit={() => {}} />}
    >
      <Settings.Section title="Preferences" footer="Changes apply immediately.">
        <Settings.Picker
          label="Appearance"
          value="system"
          options={options}
          onValueChange={(value) => {
            const selected: Appearance = value;
            return selected;
          }}
        />
        <Settings.Toggle label="Notifications" value onValueChange={() => {}} />
        <Settings.Link label="Privacy" icon="privacy" onPress={() => {}} />
        <Settings.Value label="Version" value="0.1.0" />
        <Settings.Row label="Information" description="A descriptive setting." />
      </Settings.Section>
    </Settings.Screen>
    <EmptyState title="No results" action={{ label: 'Clear', onPress: () => {} }} />
  </IdiomProvider>
);

type AppearancePicker = Parameters<typeof Settings.Picker<Appearance>>[0];
type Toggle = Parameters<typeof Settings.Toggle>[0];
type Row = Parameters<typeof Settings.Row>[0];

// @ts-expect-error The selected value must belong to the declared string union.
export const invalidPickerValue: AppearancePicker['value'] = 'sepia';

// @ts-expect-error Options must use the same string union as the selection.
export const invalidOptionValue: AppearancePicker['options'][number]['value'] = 'sepia';

// @ts-expect-error Picker values are strings, not arbitrary objects.
export const objectPickerValue: AppearancePicker['value'] = { id: 'system' };

// @ts-expect-error Picker values do not accept numeric native indices.
export const numericPickerValue: AppearancePicker['value'] = 1;

// @ts-expect-error A boolean setting requires a boolean value.
export const invalidToggleValue: Toggle['value'] = 'true';

// @ts-expect-error Public icons are semantic names, not native symbol names.
export const nativeIconName: Toggle['icon'] = 'person.crop.circle.fill';

// @ts-expect-error Low-level row styling is intentionally outside the public API.
export const rowStyle: Row['style'] = { borderRadius: 12 };

// @ts-expect-error A navigational setting requires an onPress callback.
export const linkWithoutAction = <Settings.Link label="Privacy" />;

// @ts-expect-error Callbacks must accept the picker value union.
export const numericPickerCallback: AppearancePicker['onValueChange'] = (value: number) => value;

const emailRef = createRef<FormTextFieldRef>();
const formSection: FormSectionProps = {
  title: 'Your account',
  footer: 'Your email remains private.',
  children: <></>,
};
const formScreen: Omit<FormScreenProps, 'children'> = {
  title: 'Edit profile',
  submitLabel: 'Save changes',
  onSubmit: () => {},
  submitting: false,
  submitDisabled: false,
  safeAreaEdges: ['left', 'right', 'bottom'],
  error: 'Please try again.',
  testID: 'profile',
};

export const publicFormExample = (
  <Form.Screen {...formScreen}>
    <Form.Section {...formSection}>
      <Form.TextField
        label="Name"
        kind="name"
        value="Alex"
        onChangeText={(value) => {
          const name: string = value;
          return name;
        }}
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <Form.TextField
        ref={emailRef}
        label="Email"
        kind="email"
        value="alex@example.com"
        onChangeText={() => {}}
        description="Used for account updates"
        error="Enter a valid email"
        placeholder="you@example.com"
        disabled={false}
        returnKeyType="done"
        onBlur={() => emailRef.current?.blur()}
        accessibilityLabel="Account email"
        accessibilityHint="Private account contact"
        testID="email"
      />
    </Form.Section>
  </Form.Screen>
);

// @ts-expect-error Form fields use application-owned string values.
export const numericFormValue: FormTextFieldProps['value'] = 123;

// @ts-expect-error Field callbacks receive text, not native input events.
export const eventFormCallback: FormTextFieldProps['onChangeText'] = (event: {
  nativeEvent: { text: string };
}) => event.nativeEvent.text;

// @ts-expect-error Password fields are outside the first Form API.
export const passwordFormKind: FormTextFieldProps['kind'] = 'password';

// @ts-expect-error V1 return-key behavior supports only Next and Done.
export const searchFormReturnKey: FormTextFieldProps['returnKeyType'] = 'search';

// @ts-expect-error A field must have a controlled value.
export const formFieldWithoutValue = <Form.TextField label="Name" onChangeText={() => {}} />;

export const formWithoutSubmit = (
  // @ts-expect-error Submission requires an application-owned callback.
  <Form.Screen submitLabel="Save">
    <></>
  </Form.Screen>
);

export const formWithoutSubmitLabel = (
  // @ts-expect-error Submission requires a visible action label.
  <Form.Screen onSubmit={() => {}}>
    <></>
  </Form.Screen>
);

// @ts-expect-error Public focus handles intentionally do not expose native mutation methods.
export const formNativeMutation: FormTextFieldRef['setNativeProps'] = () => {};

// @ts-expect-error Validation rules remain owned by the application.
export const formValidationSchema: FormScreenProps['schema'] = {};
