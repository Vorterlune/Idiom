# Idiom

**One API. Native conventions.**

Idiom is an opinionated wrapper around **[Expo UI (`@expo/ui`)](https://docs.expo.dev/versions/v57.0.0/sdk/ui/)** for React Native and Expo apps. It turns native UI primitives into ready-to-use settings screens and editable forms. Expo UI supplies native presentation; Idiom supplies layout, labels, semantic icons, and interaction conventions. Forms use React Native text inputs inside Expo UI presentation to keep ordinary React string values and callbacks.

Describe a preference or editable field, connect it to your state, and let Idiom handle its presentation.

## Expo UI and Idiom, compared

Both examples below show a Settings screen with a Notifications toggle and a description. Both use the same React state and assume an application-owned `SafeAreaProvider` above the screen; see [application setup](#install-in-an-application). Idiom uses its own platform defaults for spacing, typography, and interaction.

### With Expo UI

Compose the screen and preference row from individual primitives:

```tsx
import { useState } from 'react';
import { Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Host, FieldGroup, Row, Column, Spacer, Icon, Text, Switch } from '@expo/ui';

const notificationIcon = Icon.select({
  ios: 'bell.fill',
  android: import('@expo/material-symbols/notifications.xml'),
});

export function Preferences() {
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RNText
        style={{
          fontSize: 32,
          fontWeight: '700',
          margin: 20,
        }}
      >
        Settings
      </RNText>

      <Host style={{ flex: 1 }}>
        <FieldGroup>
          <FieldGroup.Section title="Preferences">
            <Row alignment="center" spacing={12} style={{ padding: 12 }}>
              <Icon name={notificationIcon} size={22} />

              <Column spacing={4}>
                <Text>Notifications</Text>
                <Text
                  textStyle={{
                    fontSize: 13,
                    color: '#777',
                  }}
                >
                  Receive important updates
                </Text>
              </Column>

              <Spacer flexible />

              <Switch value={notifications} onValueChange={setNotifications} />
            </Row>
          </FieldGroup.Section>
        </FieldGroup>
      </Host>
    </SafeAreaView>
  );
}
```

### With Idiom

Describe the preference through a component that owns that composition:

```tsx
import { useState } from 'react';
import { Settings } from '@idiom/ui';

export function Preferences() {
  const [notifications, setNotifications] = useState(true);

  return (
    <Settings.Screen title="Settings">
      <Settings.Section title="Preferences">
        <Settings.Toggle
          icon="notifications"
          label="Notifications"
          description="Receive important updates"
          value={notifications}
          onValueChange={setNotifications}
        />
      </Settings.Section>
    </Settings.Screen>
  );
}
```

The `value` and `onValueChange` contract stays the same. `Settings.Screen` supplies the safe-area view, title, native host, scrolling, and tablet width constraint. `Settings.Toggle` supplies the icon mapping, label, description, and platform-specific control behavior.

Expo UI already supports a concise `<Switch label="Notifications" ... />` for a simple preference. The reason to add Idiom is the reusable behavior around richer rows: label and description association, disabled handling, semantic colors, and platform interaction. With direct composition, the application owns those decisions; for example, the Expo UI snippet above still needs accessibility association between its separate text and switch. See [what the semantic layer adds](docs/semantic-layer.md) for the implementation tradeoffs.

## Why use Idiom?

Use Idiom when you want familiar settings and account-editing screens without maintaining the same row and field composition throughout your app.

- **Add a preference with fewer UI decisions.** Supply a label, description, semantic icon, and controlled value. Spacing, secondary text styling, and native hosting already have defaults.
- **Keep screens consistent as they grow.** Toggle, Picker, Link, and Value share the same row vocabulary. A new section follows the same conventions as the rest of your settings.
- **Keep platform details in one place.** `icon="notifications"` maps to SF Symbols on iOS and Material Symbols on Android. Platform adapters handle native grouping, controls, and row behavior behind the same public API.
- **Centralize interaction and accessibility wiring.** Idiom implements combined labels, accessibility hints, disabled guards, and controlled change callbacks. You can still provide explicit accessibility labels and hints. Native behavior remains subject to the [device verification matrix](docs/verification.md).
- **Read and review the feature logic directly.** A preference declares what it changes and which handler runs. Reviewers can focus on state updates and side effects without following a tree of layout primitives for each row.
- **Add editing without adopting another form engine.** `Form.TextField` uses a string `value` and `onChangeText`. Keep your existing state or form library; Idiom presents labels, errors, keyboard behavior, and pending submission while your application validates and saves.

## Editable forms: Expo UI and Idiom

Expo UI's native text input uses an observable value created with `useNativeState`. This focused example edits a name and hands its current value to the application:

```tsx
import { Button, FieldGroup, Host, Text, TextInput, useNativeState } from '@expo/ui';

export function EditName({ onSave }: { onSave: (name: string) => void }) {
  const name = useNativeState('Alex Morgan');

  return (
    <Host style={{ flex: 1 }}>
      <FieldGroup>
        <FieldGroup.Section title="Your account">
          <Text>Name</Text>
          <TextInput value={name} autoCapitalize="words" autoComplete="name" />
          <Button label="Save changes" onPress={() => onSave(name.value)} />
        </FieldGroup.Section>
      </FieldGroup>
    </Host>
  );
}
```

With Idiom, the application keeps a regular React string. `Form.Screen` also supplies the screen, safe-area handling, scrolling, and submit presentation:

```tsx
import { useState } from 'react';
import { Form } from '@idiom/ui';

export function EditName({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState('Alex Morgan');

  return (
    <Form.Screen title="Edit profile" submitLabel="Save changes" onSubmit={() => onSave(name)}>
      <Form.Section title="Your account">
        <Form.TextField
          kind="name"
          label="Name"
          description="The name other members see."
          value={name}
          onChangeText={setName}
        />
      </Form.Section>
    </Form.Screen>
  );
}
```

These examples use different input models. Idiom does not convert Expo's observable input into a controlled React field: it hosts a React Native `TextInput` through Expo's `RNHostView`. Expo UI still supplies the section layout and native submit button. Direct Expo UI is a good choice when you want its native input model; Idiom is useful when you want string values, field errors, and screen behavior that fit existing React application code. Native input styling and behavior therefore differ between the examples.

Pass each field's validation message as `error`. Pass a save failure as `Form.Screen`'s `error`, and bind `submitting` to your application's pending state. Validation rules, when errors appear, saving, and success navigation remain application code; neither example implements those policies for you.

## How it fits your development workflow

Start with one settings or profile-editing screen in your existing Expo app. Keep your hooks, state store, form library, persistence, permission handling, and router. Pass their values and callbacks into Idiom; a notification toggle still needs your application logic to request permission, save the preference, or call a server.

Use `IdiomProvider` when you need appearance or accent overrides. Compose reusable sections with ordinary React components, fragments, and conditional children. For custom React Native content, use the screen's `header` slot or a row's display-only `trailing` slot; see [composition and custom content](#composition-and-custom-content). The native Storybook catalogue lets you explore props, events, and appearance while developing.

Keep using Expo UI directly for screens that need custom layouts or controls outside Idiom's current patterns. Idiom is a good fit when its defaults match your product; direct primitives give you more control when they do not. The tradeoff is an extra dependency and a deliberately small styling API. The current scope is iOS and Android settings, text/name/email forms, `SearchBar`, and `EmptyState`; package availability and validation status are below.

## Status

This repository contains the v0.1 implementation and a local showcase. The npm package has not been published. Native device validation is an explicit release gate; see [verification status](docs/verification.md). Mocked component tests do not establish native rendering, accessibility, or layout correctness.

The supported targets are **iOS and Android in an Expo application with development builds**. Expo Router belongs only to the showcase. Idiom has no navigation or persistence dependency and does not implement web or desktop support.

The initial baseline is Expo SDK 57 (`expo` 57.0.25, Expo UI 57.0.20), React Native 0.86.3, and React 19.2.3. Compatible patches are recorded in the committed lockfile.

## Run the showcase

Use Node 24 and the pnpm version pinned in the root `package.json`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm start
```

Build the native development client before opening the application:

```sh
pnpm android
# On macOS with Xcode:
pnpm ios
```

Android requires the Android SDK, a supported Java runtime, and an emulator or device. iOS builds require macOS and Xcode. Native projects are generated by Expo and remain untracked. A Metro bundle check is useful, but is not a substitute for either native build.

The showcase includes Account, Preferences, and About sections, working Profile/Privacy/Licences destinations, appearance selection, search, and an empty state. Its Component lab demonstrates all public components, custom slots, wrapped components, fragments, conditional children, disabled controls, long text, and long scrolling. Preferences intentionally reset when the app process restarts; the demo sends no analytics and does not request notification permissions.

## Run Storybook

Storybook runs inside the showcase's native development client on an iOS simulator, Android emulator, or device. It renders the actual `@expo/ui` controls; a browser or Expo Go cannot run these stories.

```sh
pnpm storybook          # Start Metro in Storybook mode
pnpm storybook:ios      # Start and open the installed iOS development client
pnpm storybook:android  # Start and open the installed Android development client
```

These commands set `STORYBOOK_ENABLED=true`. Build or rebuild the development client with `pnpm ios` or `pnpm android` after installing new native dependencies. Stop Metro before switching between Storybook and the normal showcase (`pnpm start`), then close and reopen the development client. A stale client session can show a blank screen or fail while replacing its native React context.

For an Android phone connected over USB, enable USB debugging and authorize the computer, then run `adb reverse tcp:8081 tcp:8081` and `pnpm storybook:android --localhost`. If several Android devices are connected, target the phone's serial with `adb -s <serial> reverse tcp:8081 tcp:8081` and choose that device when Expo prompts.

If an iOS simulator cannot connect with `--localhost`, Metro may be listening only on IPv6 while Expo requests `127.0.0.1`. Restart it with `NODE_OPTIONS=--dns-result-order=ipv4first pnpm storybook:ios --localhost`.

The catalogue covers every public component, with Controls for props, Actions for events, and System/Light/Dark appearance. Controlled examples update their args, so editing or resetting Controls also updates the rendered value. Stories live in `apps/showcase/stories`; configuration lives in `apps/showcase/.rnstorybook`. See [contributor guidance](CONTRIBUTING.md#storybook) to add a story.

Use `pnpm storybook:generate` to regenerate the ignored story loader, or `pnpm storybook:bundle` to check both iOS and Android exports. Typechecking regenerates the loader automatically. Bundle checks do not establish native rendering or interaction correctness; see the [verification record](docs/verification.md).

## Install in an application

While the package is unpublished, build and pack `@idiom/ui`, then install the resulting tarball into an Expo application. Use Expo's installer to select compatible native dependencies:

```sh
pnpm build
pnpm --filter @idiom/ui pack
# In the consuming Expo application:
npx expo install @expo/ui react-native-safe-area-context
npm install /absolute/path/to/idiom-ui-0.1.0.tgz
```

Consult `packages/ui/package.json` for the exact supported peer ranges and additional icon dependencies. Keep React, React Native, Expo, and Expo UI aligned with the selected SDK. Rebuild the development client after changing native dependencies. Scope ownership and public release approval are still required before publishing to npm.

SDK 57 consumers building with Xcode 27 for iOS 27 must also enable `ios.enableSceneSupport` through `expo-build-properties`, then regenerate and rebuild their native app. The showcase already includes this setting. See [native setup](CONTRIBUTING.md#setup) and [Expo's guidance](https://github.com/expo/fyi/blob/main/ios-scene-lifecycle.md#staying-on-sdk-57-with-xcode-27).

Place **one application-owned safe-area provider** above your screens. `IdiomProvider` is optional; put it **above `Settings.Screen` or `Form.Screen`** and any standalone SearchBar or EmptyState so the enclosing native hosts receive the selected appearance. It applies appearance and accent overrides to Idiom content, while the application continues to own its navigation and status bar appearance.

```tsx
import { IdiomProvider } from '@idiom/ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export function App() {
  return (
    <SafeAreaProvider>
      <IdiomProvider appearance="system">
        <Preferences />
      </IdiomProvider>
    </SafeAreaProvider>
  );
}
```

Idiom never inserts a safe-area provider implicitly. A screen below a navigator that already handles the top inset should use `safeAreaEdges={['left', 'right', 'bottom']}`. By default all four edges are used. The optional Screen title is content, not a navigation header.

## Public API

Import all public components and types from `@idiom/ui`. No native adapter or renderer selection is exposed.

| Component          | Purpose and main props                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `IdiomProvider`    | `appearance`: `system`, `light`, or `dark`; optional `accentColor`. System appearance is the default.                                   |
| `Settings.Screen`  | Owns scrolling and tablet content width. `title`, React Native `header` slot, `safeAreaEdges`, and `children`.                          |
| `Settings.Section` | Groups semantic children with optional `title` and `footer`.                                                                            |
| `Settings.Row`     | `label`, `description`, semantic `icon`, display-only React Native `trailing` slot, `disabled`, optional `onPress`.                     |
| `Settings.Toggle`  | Row content plus controlled boolean `value` and `onValueChange`.                                                                        |
| `Settings.Link`    | Row content and required `onPress`, with a native navigation affordance.                                                                |
| `Settings.Value`   | Row content and a read-only string `value`.                                                                                             |
| `Settings.Picker`  | Controlled string `value`, readonly `{ label, value }` `options`, and `onValueChange`.                                                  |
| `Form.Screen`      | `onSubmit`, `submitLabel`, controlled `submitting`, `submitDisabled`, form `error`, `title`, and `safeAreaEdges`.                       |
| `Form.Section`     | Groups editable fields with optional `title` and `footer`.                                                                              |
| `Form.TextField`   | String `value`/`onChangeText`, `label`, `kind`: `text`, `name`, or `email`; optional `description`, `error`, `disabled`, and focus ref. |
| `SearchBar`        | Controlled `value`/`onChangeText`, `placeholder`, `disabled`, optional `onSubmit`, and accessible clear action.                         |
| `EmptyState`       | `title`, optional `description`/`icon`, and optional `action: { label, onPress }`.                                                      |

Interactive components expose accessibility labels/hints and `testID`. The styling surface is intentionally small: system typography, semantic colors, native controls, and platform touch targets are part of the component contract.

```tsx
const options = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
] as const;

<Settings.Picker
  label="Appearance"
  value={appearance}
  options={options}
  onValueChange={setAppearance}
/>;
```

Picker option values must be unique and include the controlled value. Toggle and picker callbacks request an actual change; application code commits it by updating `value`. The picker label and selected-choice indicator continue to reflect `value` if the application ignores or delays a callback. A disabled control does not activate, and cancelling a picker leaves state unchanged. Application code owns persistence, filtering, permissions, and side effects.

### Form state, submission, and focus

`Form.TextField` defaults to `kind="text"`. `name` and `email` select appropriate capitalization, keyboard, and autofill defaults; they do not validate or transform the string. `description` supplies help text, and `error` displays the application's current validation message. `onBlur` supports validation on leaving a field.

`Form.Screen` calls `onSubmit` as a request. Validate in that handler, set `submitting` before starting an asynchronous save, handle failures, and clear pending state when the attempt finishes. `submitting` disables every field and submission and shows a progress indicator; `submitDisabled` disables submission while leaving fields editable. Idiom does not await the callback, infer pending state, reset values, clear errors, or navigate after saving. A disabled or pending form does not submit through either the button or keyboard.

The default `returnKeyType="done"` requests screen submission unless `onSubmitEditing` overrides it. Use `returnKeyType="next"` with an explicit focus callback to move between fields:

```tsx
import { useRef, useState } from 'react';
import { Form, type FormTextFieldRef } from '@idiom/ui';

function AccountFields() {
  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex@example.com');
  const emailRef = useRef<FormTextFieldRef>(null);

  return (
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
      />
    </Form.Section>
  );
}
```

Render the section inside `Form.Screen`; in a saved form, lift the draft state into the component that handles submission. The ref exposes `focus()` and `blur()`. Next does not discover or reorder fields. Forms preserve fragments, conditional fields, and application wrapper components without inspecting their identities.

Forms own one React Native scroll viewport and reveal the focused input when the keyboard or field layout changes. They use iOS keyboard inset adjustment and Android's normal window resize behavior; Android consumers should retain Expo's resize keyboard layout mode. Do not nest `Form.Screen` inside another vertical scroll view. The submit button stays at the end of the form, rather than in a sticky footer. Passwords, multiline fields, schema validation, and automatic focus on the first error are outside the initial form API.

### Composition and custom content

Fragments, conditional children, and components returning Idiom components are supported:

```tsx
function NotificationPreferences() {
  return (
    <Settings.Section title="Notifications">
      <Settings.Toggle label="Updates" value={enabled} onValueChange={setEnabled} />
      {enabled && <Settings.Value label="Delivery" value="Immediately" />}
    </Settings.Section>
  );
}
```

Native layouts and React Native layouts have different hosting rules. Place ordinary React Native views in `Settings.Screen`'s `header` or `Settings.Row`'s `trailing` slot. The header renders directly in React Native above the native scroll viewport; trailing content crosses into the native row through Expo's `RNHostView`, with a single measured root. Avoid arbitrary `View` wrappers around native sections or rows. A trailing slot is display content; include meaningful badge text in the row's `accessibilityLabel`, and use Toggle or Picker for interactive trailing controls. `Settings.Screen` owns the vertical scroll viewport; do not put it inside another vertical ScrollView. Form fields use their own interactive hosting boundary and do not use a display-only trailing slot.

### Platform behavior

| Area               | iOS                                            | Android                                               |
| ------------------ | ---------------------------------------------- | ----------------------------------------------------- |
| Settings grouping  | SwiftUI Form and Section                       | Compose scrolling and grouped preference rows         |
| Editable forms     | RN scroll/input, Expo UI section presentation  | RN scroll/input, Expo UI section presentation         |
| Boolean preference | Native labeled Toggle                          | Material preference row with native Switch            |
| Selection          | Native menu selection                          | Native Material selection                             |
| Icons              | System SF Symbols                              | Material Symbols                                      |
| Appearance         | Semantic Apple colors and typography           | Material typography and dynamic color where available |
| Tablets            | Centered content with a 720-unit maximum width | Centered content with a 720-unit maximum width        |

Expo UI is the native foundation. Idiom reuses universal hosts, layout, icons, and slots, with platform adapters for settings rows, labels, and pickers. Android rows use one React Native accessibility and press boundary around a native Compose visual subtree so labeling, disabled state, and whole-row switch activation are controlled together. See [why a semantic layer helps](docs/semantic-layer.md) and [architecture](docs/architecture.md).

## Development and verification

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm run doctor
pnpm bundle
pnpm verify:package
```

[Contributing](CONTRIBUTING.md) explains the workflow. [Verification](docs/verification.md) defines native acceptance and the clean-tarball release gate. Maestro smoke flows live in `.maestro/`.

v0.1 excludes persistence, navigation integrations, split views, web/desktop, custom native modules, and advanced theming. Future application patterns should earn their place through real use; this repository publishes one library package until a second is needed.

## Licence

MIT. See [LICENSE](LICENSE) and [third-party notices](THIRD_PARTY_NOTICES.md).

Idiom is an open-source project by **Vorterlune**.
