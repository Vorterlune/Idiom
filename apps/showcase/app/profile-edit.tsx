import { Form, type FormTextFieldRef } from '@idiom/ui';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { usePreferences } from '../src/preferences';

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, setProfile } = usePreferences();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [errors, setErrors] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const emailField = useRef<FormTextFieldRef>(null);
  const pendingSave = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (pendingSave.current !== null) clearTimeout(pendingSave.current);
    },
    [],
  );

  function saveProfile() {
    if (pendingSave.current !== null) return;

    const nextProfile = { name: name.trim(), email: email.trim() };
    const nextErrors = {
      name: nextProfile.name ? '' : 'Enter your name.',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextProfile.email)
        ? ''
        : 'Enter a valid email address.',
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email) return;

    setSaving(true);
    pendingSave.current = setTimeout(() => {
      pendingSave.current = null;
      setProfile(nextProfile);
      setSaving(false);
      router.back();
    }, 650);
  }

  return (
    <Form.Screen
      submitLabel="Save changes"
      onSubmit={saveProfile}
      submitting={saving}
      safeAreaEdges={['left', 'right', 'bottom']}
      testID="edit-profile-screen"
    >
      <Form.Section
        title="Your account"
        footer="Changes stay in memory for this session. Saving is simulated; no data is sent to a server."
      >
        <Form.TextField
          kind="name"
          label="Name"
          value={name}
          onChangeText={setName}
          error={errors.name}
          returnKeyType="next"
          onSubmitEditing={() => emailField.current?.focus()}
          testID="profile-name-input"
        />
        <Form.TextField
          ref={emailField}
          kind="email"
          label="Email"
          value={email}
          onChangeText={setEmail}
          description="Used for account updates"
          error={errors.email}
          returnKeyType="done"
          testID="profile-email-input"
        />
      </Form.Section>
    </Form.Screen>
  );
}
