import { createRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as ExpoUI from '@expo/ui';

import { Form, IdiomProvider, type FormScreenProps, type FormTextFieldRef } from '../src';

function FormPage({
  children,
  ...props
}: { children: ReactNode } & Partial<Omit<FormScreenProps, 'children'>>) {
  return (
    <SafeAreaProvider>
      <Form.Screen title="Edit profile" submitLabel="Save changes" onSubmit={() => {}} {...props}>
        {children}
      </Form.Screen>
    </SafeAreaProvider>
  );
}

describe('form composition', () => {
  it('renders wrapped sections, fragments, and conditional fields without child inspection', async () => {
    function AccountFields({ showEmail }: { showEmail: boolean }) {
      return (
        <Form.Section title="Your account" footer="Only your name is public.">
          <>
            <Form.TextField label="Name" value="Alex" onChangeText={() => {}} />
            {showEmail ? (
              <Form.TextField
                label="Email"
                kind="email"
                value="alex@example.com"
                onChangeText={() => {}}
              />
            ) : null}
          </>
        </Form.Section>
      );
    }

    const result = await render(
      <FormPage>
        <AccountFields showEmail={false} />
      </FormPage>,
    );
    expect(screen.getByRole('header', { name: 'Edit profile' })).toBeOnTheScreen();
    expect(screen.getByText('Your account')).toBeOnTheScreen();
    expect(screen.getByText('Only your name is public.')).toBeOnTheScreen();
    expect(screen.getByLabelText('Name')).toHaveDisplayValue('Alex');
    expect(screen.queryByLabelText('Email')).toBeNull();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeOnTheScreen();

    await result.rerender(
      <FormPage>
        <AccountFields showEmail />
      </FormPage>,
    );
    expect(screen.getByLabelText('Email')).toHaveDisplayValue('alex@example.com');
  });
});

describe('controlled form fields', () => {
  it('emits a single edit and preserves the parent value when the edit is ignored', async () => {
    const onChangeText = jest.fn();
    const result = await render(
      <FormPage>
        <Form.TextField label="Name" value="Alex" onChangeText={onChangeText} />
      </FormPage>,
    );
    await fireEvent.changeText(screen.getByLabelText('Name'), 'Alexandra');
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenLastCalledWith('Alexandra');
    expect(screen.getByLabelText('Name')).toHaveDisplayValue('Alex');

    await result.rerender(
      <FormPage>
        <Form.TextField label="Name" value="Parent reset" onChangeText={onChangeText} />
      </FormPage>,
    );
    expect(screen.getByLabelText('Name')).toHaveDisplayValue('Parent reset');
    expect(onChangeText).toHaveBeenCalledTimes(1);
  });

  it('displays parent transformations and accepts a reset to an empty value', async () => {
    function Example({ initialValue }: { initialValue: string }) {
      const [name, setName] = useState(initialValue);
      return (
        <FormPage onSubmit={() => setName('')}>
          <Form.TextField
            label="Name"
            value={name}
            onChangeText={(value) => setName(value.toUpperCase())}
          />
        </FormPage>
      );
    }
    await render(<Example initialValue="Alex" />);
    await fireEvent.changeText(screen.getByLabelText('Name'), 'alice');
    expect(screen.getByLabelText('Name')).toHaveDisplayValue('ALICE');
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByLabelText('Name')).toHaveDisplayValue('');
  });

  it('reports blur without changing or submitting the current value', async () => {
    const onBlur = jest.fn();
    const onChangeText = jest.fn();
    const onSubmit = jest.fn();
    await render(
      <FormPage onSubmit={onSubmit}>
        <Form.TextField label="Name" value="Alex" onChangeText={onChangeText} onBlur={onBlur} />
      </FormPage>,
    );
    await fireEvent(screen.getByLabelText('Name'), 'blur');
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onChangeText).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([
    { kind: 'text', keyboardType: 'default', autoCapitalize: 'sentences' },
    { kind: 'name', keyboardType: 'default', autoCapitalize: 'words', autoComplete: 'name' },
    { kind: 'email', keyboardType: 'email-address', autoCapitalize: 'none', autoComplete: 'email' },
  ] as const)('provides the $kind entry defaults to the native input', async (defaults) => {
    await render(
      <FormPage>
        <Form.TextField
          kind={defaults.kind}
          label="Profile field"
          value=""
          onChangeText={() => {}}
          placeholder="Enter a value"
        />
      </FormPage>,
    );
    const input = screen.getByPlaceholderText('Enter a value');
    expect(input).toHaveProp('keyboardType', defaults.keyboardType);
    expect(input).toHaveProp('autoCapitalize', defaults.autoCapitalize);
    if ('autoComplete' in defaults) {
      expect(input).toHaveProp('autoComplete', defaults.autoComplete);
    }
  });
});

describe('form submission and focus', () => {
  it('uses the same submit callback for the button and the default Done key', async () => {
    const onSubmit = jest.fn();
    await render(
      <FormPage onSubmit={onSubmit}>
        <Form.TextField label="Name" value="Alex" onChangeText={() => {}} />
      </FormPage>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await fireEvent(screen.getByLabelText('Name'), 'submitEditing');
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText('Name')).toHaveDisplayValue('Alex');
  });

  it('lets the application override Done without also submitting the screen', async () => {
    const onSubmit = jest.fn();
    const onSubmitEditing = jest.fn();
    await render(
      <FormPage onSubmit={onSubmit}>
        <Form.TextField
          label="Name"
          value="Alex"
          onChangeText={() => {}}
          onSubmitEditing={onSubmitEditing}
        />
      </FormPage>,
    );
    await fireEvent(screen.getByLabelText('Name'), 'submitEditing');
    expect(onSubmitEditing).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('allows Next to focus a caller-selected field and exposes blur on the same ref', async () => {
    const emailRef = createRef<FormTextFieldRef>();
    const onSubmit = jest.fn();
    // Native command spies verify the imperative bridge, not actual device keyboard behavior.
    const focus = jest.spyOn(TextInput.prototype, 'focus');
    const blur = jest.spyOn(TextInput.prototype, 'blur');
    try {
      await render(
        <FormPage onSubmit={onSubmit}>
          <Form.Section>
            <Form.TextField
              label="Name"
              value="Alex"
              onChangeText={() => {}}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            <Form.TextField
              ref={emailRef}
              label="Email"
              value="alex@example.com"
              onChangeText={() => {}}
            />
          </Form.Section>
        </FormPage>,
      );
      await fireEvent(screen.getByLabelText('Name'), 'submitEditing');
      expect(focus).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
      await act(() => emailRef.current?.blur());
      expect(blur).toHaveBeenCalledTimes(1);
    } finally {
      focus.mockRestore();
      blur.mockRestore();
    }
  });

  it('does not turn an unhandled Next key into a submission', async () => {
    const onSubmit = jest.fn();
    await render(
      <FormPage onSubmit={onSubmit}>
        <Form.TextField label="Name" value="Alex" onChangeText={() => {}} returnKeyType="next" />
      </FormPage>,
    );
    await fireEvent(screen.getByLabelText('Name'), 'submitEditing');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each(['disabled', 'submitting'] as const)(
    'does not focus a field through its public ref while %s',
    async (blockedBy) => {
      const ref = createRef<FormTextFieldRef>();
      const focus = jest.spyOn(TextInput.prototype, 'focus');
      try {
        await render(
          <FormPage submitting={blockedBy === 'submitting'}>
            <Form.TextField
              ref={ref}
              label="Name"
              value="Alex"
              onChangeText={() => {}}
              disabled={blockedBy === 'disabled'}
            />
          </FormPage>,
        );
        await act(() => ref.current?.focus());
        expect(focus).not.toHaveBeenCalled();
      } finally {
        focus.mockRestore();
      }
    },
  );

  it('blocks submission while submitDisabled leaves fields editable', async () => {
    const onSubmit = jest.fn();
    const onChangeText = jest.fn();
    await render(
      <FormPage onSubmit={onSubmit} submitDisabled>
        <Form.TextField label="Name" value="Alex" onChangeText={onChangeText} />
      </FormPage>,
    );
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    expect(screen.getByLabelText('Name')).not.toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText('Name'), 'Alice');
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    await fireEvent(screen.getByLabelText('Name'), 'submitEditing');
    expect(onChangeText).toHaveBeenCalledWith('Alice');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks editing, return-key handlers, and button submission while pending, then recovers', async () => {
    const onSubmit = jest.fn();
    const onChangeText = jest.fn();
    const onSubmitEditing = jest.fn();
    const fields = (
      <Form.Section>
        <Form.TextField label="Name" value="Alex" onChangeText={onChangeText} />
        <Form.TextField
          label="Email"
          value="alex@example.com"
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
        />
      </Form.Section>
    );
    const result = await render(
      <FormPage onSubmit={onSubmit} submitting>
        {fields}
      </FormPage>,
    );
    expect(screen.getByLabelText('Name')).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    expect(screen.getByRole('progressbar', { busy: true })).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Name'), 'Alice');
    await fireEvent(screen.getByLabelText('Name'), 'submitEditing');
    await fireEvent(screen.getByLabelText('Email'), 'submitEditing');
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onSubmitEditing).not.toHaveBeenCalled();
    expect(onChangeText).not.toHaveBeenCalled();

    await result.rerender(<FormPage onSubmit={onSubmit}>{fields}</FormPage>);
    expect(screen.getByLabelText('Name')).not.toBeDisabled();
    expect(screen.queryByRole('progressbar')).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Name'), 'Alice');
    await fireEvent(screen.getByLabelText('Name'), 'submitEditing');
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables a single field without preventing other edits or screen submission', async () => {
    const onChangeText = jest.fn();
    const onSubmitEditing = jest.fn();
    const onSubmit = jest.fn();
    await render(
      <FormPage onSubmit={onSubmit}>
        <Form.Section>
          <Form.TextField
            label="Account ID"
            value="123"
            disabled
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
          />
          <Form.TextField label="Name" value="Alex" onChangeText={onChangeText} />
        </Form.Section>
      </FormPage>,
    );
    expect(screen.getByLabelText('Account ID')).toBeDisabled();
    expect(screen.getByLabelText('Name')).not.toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText('Account ID'), '456');
    await fireEvent(screen.getByLabelText('Account ID'), 'submitEditing');
    expect(onChangeText).not.toHaveBeenCalled();
    expect(onSubmitEditing).not.toHaveBeenCalled();
    await fireEvent.changeText(screen.getByLabelText('Name'), 'Alice');
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(onChangeText).toHaveBeenCalledWith('Alice');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('leaves submission lifecycle under application control even for a returned promise', async () => {
    const onSubmit = jest.fn(() => new Promise<void>(() => {}));
    await render(
      <FormPage onSubmit={onSubmit}>
        <Form.TextField label="Name" value="Alex" onChangeText={() => {}} />
      </FormPage>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Name')).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save changes' })).not.toBeDisabled();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});

describe('form accessibility and appearance', () => {
  it('keeps an editable input named independently of its visible label with help and errors', async () => {
    await render(
      <FormPage error="Could not save your profile. Try again.">
        <Form.TextField
          label="Email"
          value="invalid"
          onChangeText={() => {}}
          description="Used for account updates"
          error="Enter a valid email address"
          accessibilityLabel="Account email"
          accessibilityHint="This address is private"
        />
      </FormPage>,
    );
    const input = screen.getByLabelText('Account email');
    expect(input).toHaveDisplayValue('invalid');
    expect(input.props.accessibilityHint).toEqual(
      expect.stringContaining('Used for account updates'),
    );
    expect(input.props.accessibilityHint).toEqual(
      expect.stringContaining('This address is private'),
    );
    expect(input.props.accessibilityHint).toEqual(
      expect.stringContaining('Enter a valid email address'),
    );
    expect(screen.getAllByDisplayValue('invalid')).toHaveLength(1);
    expect(screen.getByText('Email')).toBeOnTheScreen();
    expect(screen.getByText('Used for account updates')).toBeOnTheScreen();
    expect(screen.getByText('Enter a valid email address')).toBeOnTheScreen();
    expect(screen.getByText('Could not save your profile. Try again.')).toBeOnTheScreen();
  });

  it('updates the error and its hint after caller validation without replacing the controlled text', async () => {
    const field = (error?: string) => (
      <FormPage>
        <Form.TextField
          label="Email"
          value="alex@example.com"
          onChangeText={() => {}}
          description="Used for account updates"
          {...(error === undefined ? {} : { error })}
        />
      </FormPage>
    );
    const result = await render(field('Check this email'));
    await result.rerender(field());
    expect(screen.queryByText('Check this email')).toBeNull();
    expect(screen.getByLabelText('Email').props.accessibilityHint).not.toContain(
      'Check this email',
    );
    expect(screen.getByLabelText('Email')).toHaveDisplayValue('alex@example.com');
  });

  it('announces a new error without repeating it during unrelated controlled edits', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions');
    function Example({ name, error }: { name: string; error?: string }) {
      return (
        <FormPage>
          <Form.Section>
            <Form.TextField label="Name" value={name} onChangeText={() => {}} />
            <Form.TextField
              label="Email"
              value="invalid"
              onChangeText={() => {}}
              {...(error === undefined ? {} : { error })}
            />
          </Form.Section>
        </FormPage>
      );
    }
    try {
      const result = await render(<Example name="Alex" />);
      await result.rerender(<Example name="Alex" error="Enter a valid email" />);
      const announcementCount = announce.mock.calls.length;
      if (Platform.OS === 'ios') {
        expect(announce).toHaveBeenCalledTimes(1);
        expect(announce).toHaveBeenCalledWith('Enter a valid email', { queue: true });
      } else {
        expect(screen.getByText('Enter a valid email')).toHaveProp(
          'accessibilityLiveRegion',
          'polite',
        );
      }
      await result.rerender(<Example name="Alice" error="Enter a valid email" />);
      expect(announce).toHaveBeenCalledTimes(announcementCount);
    } finally {
      announce.mockRestore();
    }
  });

  it('applies local appearance and accent changes without resetting a field', async () => {
    function Example({ appearance }: { appearance: 'light' | 'dark' }) {
      return (
        <IdiomProvider appearance={appearance} accentColor="#123abc">
          <FormPage>
            <Form.TextField label="Name" value="Alex" onChangeText={() => {}} />
          </FormPage>
        </IdiomProvider>
      );
    }
    // Expo hosts are the native boundary for appearance and seed-color overrides.
    const host = jest.spyOn(ExpoUI, 'Host');
    try {
      const result = await render(<Example appearance="light" />);
      const lightStyle = screen.getByLabelText('Name').props.style;
      expect(host).toHaveBeenLastCalledWith(
        expect.objectContaining({ colorScheme: 'light', seedColor: '#123abc' }),
        undefined,
      );
      await result.rerender(<Example appearance="dark" />);
      const input = screen.getByLabelText('Name');
      expect(input).toHaveDisplayValue('Alex');
      expect(host).toHaveBeenLastCalledWith(
        expect.objectContaining({ colorScheme: 'dark', seedColor: '#123abc' }),
        undefined,
      );
      if (Platform.OS === 'ios') {
        expect(input.props.style).not.toEqual(lightStyle);
        expect(input).toHaveProp('selectionColor', '#123abc');
      }
    } finally {
      host.mockRestore();
    }
  });
});
