---
title: Forms
description: Controlled single-line fields with labels, help, errors, keyboard behavior, and submission feedback.
---

Applications own values, validation, and saving. Idiom supplies field and screen presentation using React Native text inputs inside Expo UI sections.

```tsx title="EditProfile.tsx"
import { useRef, useState } from 'react';
import { Form, type FormTextFieldRef } from '@idiom/ui';

export function EditProfile({
  save,
}: {
  save: (profile: { name: string; email: string }) => Promise<void>;
}) {
  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex@example.com');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const emailRef = useRef<FormTextFieldRef>(null);

  async function saveProfile() {
    const invalidEmail = !email.includes('@');
    setEmailError(invalidEmail ? 'Enter an email address.' : undefined);
    if (invalidEmail) return;
    setSaveError(undefined);
    setSaving(true);
    try {
      await save({ name, email });
    } catch {
      setSaveError('We could not save your changes. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Form.Screen
      title="Edit profile"
      submitLabel="Save changes"
      onSubmit={saveProfile}
      submitting={saving}
      {...(saveError ? { error: saveError } : {})}
    >
      <Form.Section title="Your account">
        <Form.TextField
          kind="name"
          label="Name"
          value={name}
          onChangeText={setName}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <Form.TextField
          ref={emailRef}
          kind="email"
          label="Email"
          value={email}
          onChangeText={setEmail}
          description="Used for account updates"
          {...(emailError ? { error: emailError } : {})}
        />
      </Form.Section>
    </Form.Screen>
  );
}
```

The email check here illustrates validation ownership; choose validation rules appropriate to your application.

## Screen and section

`Form.Screen` requires `children`, `submitLabel`, and `onSubmit`. Optional props are `title`, `safeAreaEdges`, `submitting`, `submitDisabled`, a form-level `error`, and `testID`.

`Form.Section` requires `children`; `title`, `footer`, and `testID` are optional. Fragments, conditional fields, and reusable section components work normally.

## Text fields

`Form.TextField` requires a string `value`, `onChangeText`, and `label`.

| Prop                                                | Behavior                                                                                     |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `kind`                                              | `text` by default; `name` and `email` select keyboard, capitalization, and autofill defaults |
| `description`                                       | Visible field help                                                                           |
| `error`                                             | Visible validation message, also associated with the input                                   |
| `placeholder`                                       | Placeholder text                                                                             |
| `disabled`                                          | Disables only this field                                                                     |
| `ref`                                               | Exposes `focus()` and `blur()`                                                               |
| `returnKeyType`                                     | `next` or `done`; defaults to `done`                                                         |
| `onSubmitEditing`                                   | Overrides the default Done screen-submission request                                         |
| `onBlur`                                            | Field blur callback                                                                          |
| `accessibilityLabel`, `accessibilityHint`, `testID` | Explicit accessible metadata and test identifier                                             |

See the [public types](/Idiom/docs/reference/public-api/) for the exact contract.

## Pending and disabled states

`submitting` and `submitDisabled` default to false. While submitting, all editing and submission are disabled and busy feedback appears. `submitDisabled` affects submission only.

The button and default Done key share a submission guard. Set pending state before asynchronous work and handle completion and failures in the application. Idiom does not inspect returned promises, clear errors, reset fields, or navigate after saving.

## Keyboard and input model

Forms owns one React Native ScrollView. iOS uses automatic keyboard insets; Android uses the application’s resize behavior. Focused fields are revealed using native measurements.

Expo UI’s current input uses observable state. Idiom deliberately uses an RN `TextInput` so values remain ordinary React strings. There is no second form state model inside the wrapper.

V1 supports single-line text, names, and email. Passwords, multiline text, form-state hooks, schema validation, persistence, and navigation guards are outside this interface. Native autofill and comprehensive screen-reader behavior remain subject to the [verification record](/Idiom/docs/status/verification/).
