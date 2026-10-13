# What the semantic layer adds

Expo UI already makes native settings screens practical. Idiom builds on that foundation. A minimal toggle screen is nearly as short with either library; fewer JSX lines alone would be a weak reason to add another dependency.

The following equivalent starting points use APIs checked against the installed `@expo/ui` 57.0.20 source. Both assume an application-owned safe-area provider above the screen, a boolean `enabled`, and a setter `setEnabled`.

## Direct Expo UI

```tsx
import { FieldGroup, Host, Switch } from '@expo/ui';

<Host style={{ flex: 1 }}>
  <FieldGroup>
    <FieldGroup.Section title="Preferences">
      <Switch label="Notifications" value={enabled} onValueChange={setEnabled} />
    </FieldGroup.Section>
  </FieldGroup>
</Host>;
```

Expo supplies the host, native grouping, and native switch. The [universal Switch source](https://github.com/expo/expo/blob/sdk-57/packages/expo-ui/src/universal/Switch/types.ts) accepts a label, value, callback, disabled flag, test ID, and native modifiers. This is an effective native primitive API.

## Idiom

```tsx
import { Settings } from '@idiom/ui';

<Settings.Screen>
  <Settings.Section title="Preferences">
    <Settings.Toggle label="Notifications" value={enabled} onValueChange={setEnabled} />
  </Settings.Section>
</Settings.Screen>;
```

The benefit appears as the application concept grows:

```tsx
<Settings.Toggle
  icon="notifications"
  label="Notifications"
  description="Receive important updates"
  accessibilityHint="Changes notification delivery for this account"
  value={enabled}
  onValueChange={setEnabled}
/>
```

The application still describes a boolean preference. It does not select symbol names, native layout containers, native modifier APIs, row semantics, or a renderer. Idiom owns that implementation and verifies it on each platform.

| Application concern  | Direct primitive composition                         | Idiom contract                                       |
| -------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| Icon                 | Choose SF Symbol and Material asset                  | Choose semantic `notifications`                      |
| Rich label           | Compose label, secondary text, icon, and control     | Supply `label`, `description`, and `icon`            |
| Interaction          | Associate label/control and verify nested activation | One coherent preference interaction                  |
| Accessible content   | Wire native semantics and disabled state             | Semantic labels, hints, state, and guarded callbacks |
| Tablet layout/insets | Configure viewport, max width, safe areas            | Screen consumes insets and bounds content            |
| Wrapper components   | Check how native containers classify children        | Preserve fragments, conditions, and user components  |

These are intended library responsibilities, not a claim that a JavaScript test proves native accessibility. The [native verification matrix](verification.md) remains required to validate the result.

## Why the layout adapters exist

Expo's Android FieldGroup currently recognizes sections by React component identity. A user component that returns a section is not recognized before React renders it. Idiom keeps native layout adapters so it can preserve wrapper composition. See the [grouping implementation](https://github.com/expo/expo/blob/sdk-57/packages/expo-ui/src/universal/FieldGroup/groupChildren.tsx).

Expo's universal iOS ListItem wraps its content in a Button. Nesting an interactive switch inside that button would require careful accessibility and event handling; a native labeled Toggle is a better starting point for Idiom's boolean preference contract. See the [iOS ListItem implementation](https://github.com/expo/expo/blob/sdk-57/packages/expo-ui/src/universal/ListItem/ListItem.ios.tsx).

Hosting and icons are reused. Idiom's trailing slots use [RNHostView](https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/rnhostview/); the Screen header lives directly in React Native above the native viewport. Semantic icon names map to Expo's [Icon](https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/icon/). Idiom does not introduce another native bridge or bundle Apple artwork.

Android currently needs a React Native accessibility/event boundary around the Compose row because the exposed Compose modifier API does not express the complete label, hint, value, and disabled contract. Native picker adapters similarly retain rich labels and accessible row anchors. These exceptions should be reconsidered as the universal APIs gain the necessary capabilities, without changing the public semantic API.

The iOS selection adapter uses native Menu/Button choices because the installed Expo SwiftUI Picker retains local selection when the parent does not accept its callback. Idiom derives the visible label and choice checkmarks from the controlled value, keeping application state authoritative even when an update is rejected or delayed. Native focus and screen-reader behavior still require the device checks in the verification matrix.

## Editable forms keep application state in React

Profile editing adds a different repeated pattern: label, help text, current value, validation message, keyboard behavior, and submission state. `Form.TextField` describes that field through a string `value`, `onChangeText`, and optional `error`; `Form.Screen` presents submission and pending state. The application keeps its existing validation and saving code.

This is a deliberate input-model choice. Expo UI's [universal TextInput contract](https://github.com/expo/expo/blob/sdk-57/packages/expo-ui/src/universal/TextInput/types.ts) takes a native observable string. Idiom uses React Native TextInput hosted through `RNHostView` for a React-controlled string. It does not claim to make the native observable input controlled by mirroring two state stores. Expo UI provides the surrounding section layout and submit button; the editable text is an RN control. See the [README comparison](../README.md#editable-forms-expo-ui-and-idiom).

| Application concern | Idiom form contract                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Draft values        | Application string values and change handlers                                                  |
| Validation          | Application rules and timing; Idiom displays supplied messages                                 |
| Submission          | One guarded request from button or Done; application controls saving and pending state         |
| Input purpose       | `kind="text"`, `"name"`, or `"email"` supplies keyboard, capitalization, and autofill defaults |
| Focus               | An explicit focus/blur ref and submit override; no inferred child order                        |
| Keyboard visibility | One RN scroll viewport measures the focused input across native hosting boundaries             |

Forms use non-scrolling Expo layouts inside an RN scroll viewport because the existing native Settings scrollers do not provide the same imperative focus-reveal interface. That implementation detail remains internal; consumers supply fields and handlers. It does not change Settings' native scrolling or introduce another state-management dependency. Native keyboard transitions, measurement, and screen-reader announcements still require the [device checks](verification.md).

Settings and editable forms are application patterns, rather than aliases for every Expo primitive. Further additions should continue to follow real consumer needs.
