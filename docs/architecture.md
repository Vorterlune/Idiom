# Architecture

Idiom provides one public package, `@idiom/ui`, and an Expo Router showcase. Shared types, accessibility helpers, icon mappings, theme handling, and native adapters stay internal until another package has an actual need for them.

```text
Application state and navigation
            ↓
Idiom semantic settings and form components
            ↓
Expo UI primitives + React Native input/scroll adapters
            ↓
SwiftUI / Compose + React Native controls
```

## Ownership

Applications own controlled values, validation rules and timing, draft state, asynchronous saving, persistence, permissions, navigation, filtering, safe-area provider setup, and navigation/status-bar appearance. Idiom owns native grouping, semantic icons, row and field content, controls, layout, accessible labeling, and platform interaction conventions. `IdiomProvider` changes Idiom content appearance without changing global application state. Place it above `Settings.Screen`, `Form.Screen`, and standalone controls so their enclosing native hosts receive the selected appearance; a provider inside an existing native subtree does not replace its parent host.

Each Screen owns one bounded vertical scroll viewport and consumes application-provided safe-area insets. It centers content at a maximum width of 720 logical units. Settings uses native scrolling; Forms uses React Native scrolling to control focused-input visibility. A Screen title is content; a navigation framework is not required. Navigator-owned inset edges can be excluded explicitly.

## Universal first, with narrow exceptions

Prefer Expo UI universal components when they meet the semantic contract. Settings Screen and Section use native adapters to preserve ordinary React composition without inspecting child component identities. iOS Toggle uses a labeled native Toggle, rather than placing a switch inside a row that is itself a Button.

Android rows place a measured Compose visual subtree inside a React Native Pressable, hosted back into the native layout through `RNHostView`. That single React Native boundary owns the accessible role, label, hint, disabled state, current value, ripple, and press event. The visual native subtree is hidden from accessibility and pointer events, so the switch and its label do not compete for focus or trigger two changes. This is a scoped fallback for Expo's current Compose semantics surface and must be tested with TalkBack on a device.

Read-only rows have no activation and are exposed with text semantics. Link adds the platform navigation affordance and delegates the action to the caller. Picker uses a SwiftUI Menu with Button choices on iOS and a Compose exposed dropdown on Android; direct native adapters preserve the rich row label and accessible anchor contract.

Expo UI 57.0.20's [native SwiftUI Picker](https://github.com/expo/expo/blob/sdk-57/packages/expo-ui/ios/Picker/PickerView.swift) retains a local selection after a change, even if the application rejects that change by keeping the same controlled value. Idiom uses a native Menu instead: labels and choice checkmarks derive directly from the application value, and a choice only emits a change request. Ignored or delayed callbacks cannot replace the caller's state. Cancellation and selecting the current value emit nothing. Native menu focus and announcements remain part of device verification.

SearchBar uses React Native TextInput for controlled text and an accessible clear action. EmptyState composes native primitives. For iOS React Native surfaces, system appearance uses semantic `PlatformColor` values; explicitly forced light/dark appearance uses a local color palette because platform colors follow the device appearance. Native SwiftUI descendants receive their appearance through the enclosing host. Android uses Material colors, including dynamic color when available.

## Forms

The public form family contains `Form.Screen`, `Form.Section`, and `Form.TextField`. It is a presentation layer for text, name, and email editing. The application supplies string values and change callbacks, field and form errors, and controlled pending state. There is no field-value store, schema engine, persistence adapter, or dependency on a form library. Values are neither trimmed nor validated by `kind`; it only selects input defaults.

Expo UI's universal TextInput takes `ObservableState<string>`, which native fields update directly. That contract differs from an application-owned React string. Form fields use React Native TextInput through an interactive `RNHostView`, following the controlled-input approach already used by SearchBar. The host takes its width from the native parent and measures its height from one RN root with `matchContents={{ vertical: true }}`. Input, label, description, and error stay together in that root. The input owns focus, text entry, accessibility labeling, disabled state, and test ID. It must not be wrapped in a pressable row or the decorative `NativeSlot`, which suppresses interaction and accessibility.

The screen uses a single React Native ScrollView; non-scrolling Expo layouts provide section presentation and a native button provides submission. The submit button and form error appear at the end of the scrolling content. This is deliberately separate from Settings' SwiftUI Form and Compose scroll layouts. Expo hosts measure their content height and ignore native safe areas; the surrounding screen owns safe areas and keyboard adjustment.

On iOS, the ScrollView adjusts keyboard insets without an additional KeyboardAvoidingView or automatic navigation insets. Android uses the application's normal resize keyboard mode without adding another keyboard-height padding. Focused-field visibility is measured in window coordinates across hosting boundaries, then corrected through the RN ScrollView. Visibility is rechecked when focus, keyboard geometry, viewport size, or content layout changes. Measurements must be ignored after the field blurs or unmounts. Field growth, keyboard transitions, and large text require native verification; mocked layout callbacks cannot establish their correctness.

`submitting` disables all fields and submission. `submitDisabled` affects submission only; field-level `disabled` remains independent. Button presses and the default Done keyboard action use the same guarded submit request. The handler returns void: the application validates, marks a save pending, catches failures, and clears pending state. Idiom does not infer pending state from a returned Promise or hold a lock waiting for the application to enter pending state, since validation may reject synchronously. It does not reset values, clear errors, or navigate.

`returnKeyType` is limited to `next` and `done`, defaulting to `done`. A field's optional `onSubmitEditing` overrides the default screen-submit action. Consumers wire Next to another field's `FormTextFieldRef.focus()`; the ref also exposes `blur()`. The library does not inspect children to determine focus order or automatically focus an invalid field. Labels and current errors are exposed to assistive technology, and changed errors are announced without repeatedly announcing unchanged text. Both screen-reader behavior and keyboard interactions remain device-verification requirements.

## Confirmation dialogs

`ConfirmationDialog` presents one native Confirm/Cancel decision through Expo SwiftUI Alert on iOS and Compose AlertDialog on Android. It owns a small, absolutely positioned Host beside screen content. The iOS alert has a transparent, inaccessible text anchor; it adds no interactive trigger or meaningful layout space. Applications render the dialog beside their screen and use an existing row or button to update `open`.

Each false-to-true transition creates a fresh presentation. A synchronous resolution guard prevents repeated button or native dismissal events from emitting multiple requests. Confirm requests `onOpenChange(false)` before `onConfirm`; Cancel only requests closure. Native dismissal waits one animation frame so a queued button activation can resolve the choice first. Cleanup cancels pending dismissal, and callbacks from an old or unmounted presentation are ignored. A resolved presentation remains closed if the caller ignores its closure request; a new false-to-true transition is required to reopen.

The application accepts user closure by updating `open` and owns all subsequent work, progress, errors, and navigation. Prop-driven closure emits no user callbacks. There is no inferred Promise lifecycle, dialog queue, or persistence. Destructive actions use SwiftUI's destructive role and the existing Material error color. Native hosts receive local appearance and accent preferences without changing global appearance. Actual modal accessibility, focus restoration, and appearance remain device-verification requirements.

The iOS 27/Expo UI 57.0.23 native check found that a provider-only dark override does not change the system alert surface, although device appearance and accent changes work. Expo's preferred-color-scheme modifier on the Alert and Host, including presentation after anchor layout, did not correct it. Those ineffective workarounds are not retained. The wrapper does not change global application appearance to compensate; this requirement remains unresolved and is recorded in the verification log.

## Native and React Native content

Settings Screen's `header` is an explicit React Native slot above the native scrolling viewport, so it does not need a bridge. Row's `trailing` content uses Expo `RNHostView`, with one React Native root so Yoga can measure it consistently. Display slots must not introduce an independent accessible control inside an interactive row. Include meaningful trailing content in the row's accessible label. Arbitrary React Native wrappers do not belong between native rows and their native layout container. Forms provide a separate interactive RN boundary for editable fields; display-only slot rules must not be applied to it.

Fragments, conditional rows, and application wrapper components require no child inspection and must remain supported. Platform adapters must not translate children into metadata arrays based on component identity.

## Packaging

Use one concrete public entrypoint. Preserve platform-specific internal files and extensionless internal imports so Metro can choose the appropriate adapter. Do not map an export directly to a nonexistent platform-neutral file and expect Metro to expand an exact export target.

Publish unbundled JavaScript, declarations, and the React Native source entry, with native runtime dependencies declared as peers. Every release is checked by packing and installing the package in a clean consumer outside the monorepo. That check exercises the public package, not private workspace aliases.

## Scope

No custom native modules, persistence layer, state management framework, animation system, navigation integration, web renderer, or advanced theming engine is part of v0.1. Forms additionally exclude password and multiline inputs, schema validation, automatic field-order discovery, and automatic focus on errors. Settings and Forms keep their application contracts small while supporting native presentation and ordinary React composition.
