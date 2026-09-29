# Architecture

Idiom provides one public package, `@idiom/ui`, and an Expo Router showcase. Shared types, accessibility helpers, icon mappings, theme handling, and native adapters stay internal until another package has an actual need for them.

```text
Application state and navigation
            ↓
Idiom semantic settings components
            ↓
Expo UI universal primitives + small platform adapters
            ↓
       SwiftUI / Compose
```

## Ownership

Applications own controlled values, persistence, permissions, navigation, filtering, safe-area provider setup, and navigation/status-bar appearance. Idiom owns native grouping, semantic icons, row content, controls, layout, accessible labeling, and platform interaction conventions. `IdiomProvider` changes Idiom content appearance without changing global application state. Place it above `Settings.Screen` and standalone controls so their enclosing native hosts receive the selected appearance; a provider inside an existing native subtree does not replace its parent host.

Screen owns one bounded vertical native scroll viewport and consumes application-provided safe-area insets. It centers content at a maximum width of 720 logical units. A Screen title is content; a navigation framework is not required. Navigator-owned inset edges can be excluded explicitly.

## Universal first, with narrow exceptions

Prefer Expo UI universal components when they meet the semantic contract. Screen and Section use native adapters to preserve ordinary React composition without inspecting child component identities. iOS Toggle uses a labeled native Toggle, rather than placing a switch inside a row that is itself a Button.

Android rows place a measured Compose visual subtree inside a React Native Pressable, hosted back into the native layout through `RNHostView`. That single React Native boundary owns the accessible role, label, hint, disabled state, current value, ripple, and press event. The visual native subtree is hidden from accessibility and pointer events, so the switch and its label do not compete for focus or trigger two changes. This is a scoped fallback for Expo's current Compose semantics surface and must be tested with TalkBack on a device.

Read-only rows have no activation and are exposed with text semantics. Link adds the platform navigation affordance and delegates the action to the caller. Picker uses a SwiftUI Menu with Button choices on iOS and a Compose exposed dropdown on Android; direct native adapters preserve the rich row label and accessible anchor contract.

Expo UI 57.0.20's [native SwiftUI Picker](https://github.com/expo/expo/blob/sdk-57/packages/expo-ui/ios/Picker/PickerView.swift) retains a local selection after a change, even if the application rejects that change by keeping the same controlled value. Idiom uses a native Menu instead: labels and choice checkmarks derive directly from the application value, and a choice only emits a change request. Ignored or delayed callbacks cannot replace the caller's state. Cancellation and selecting the current value emit nothing. Native menu focus and announcements remain part of device verification.

SearchBar uses React Native TextInput for controlled text and an accessible clear action. EmptyState composes native primitives. For iOS React Native surfaces, system appearance uses semantic `PlatformColor` values; explicitly forced light/dark appearance uses a local color palette because platform colors follow the device appearance. Native SwiftUI descendants receive their appearance through the enclosing host. Android uses Material colors, including dynamic color when available.

## Native and React Native content

Screen's `header` is an explicit React Native slot above the native scrolling viewport, so it does not need a bridge. Row's `trailing` content uses Expo `RNHostView`, with one React Native root so Yoga can measure it consistently. Display slots must not introduce an independent accessible control inside an interactive row. Include meaningful trailing content in the row's accessible label. Arbitrary React Native wrappers do not belong between native rows and their native layout container.

Fragments, conditional rows, and application wrapper components require no child inspection and must remain supported. Platform adapters must not translate children into metadata arrays based on component identity.

## Packaging

Use one concrete public entrypoint. Preserve platform-specific internal files and extensionless internal imports so Metro can choose the appropriate adapter. Do not map an export directly to a nonexistent platform-neutral file and expect Metro to expand an exact export target.

Publish unbundled JavaScript, declarations, and the React Native source entry, with native runtime dependencies declared as peers. Every release is checked by packing and installing the package in a clean consumer outside the monorepo. That check exercises the public package, not private workspace aliases.

## Scope

No custom native modules, persistence layer, state management framework, animation system, navigation integration, web renderer, or advanced theming engine is part of v0.1. Settings establishes whether a semantic application contract can remain small while supporting native presentation and composition.
