# Verification record and release gates

## Current status

The implementation is developed on Windows. Native iOS execution requires macOS/Xcode, and Android execution requires an Android SDK, a compatible Java runtime, and a running device or emulator. The project owner will run the Mac/device checks. Native checks below are **pending until run and recorded**. Automated mocked tests and Metro bundle checks cannot be substituted for them.

### Automated record — 2026-09-29

Environment: Windows, Node 24.19, pnpm 11.19, Expo 57.0.25, Expo UI 57.0.20, React Native 0.86.3, and React 19.2.3.

| Check                                                         | Result                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Library, showcase, public type contracts, and test TypeScript | Passed                                                                                |
| ESLint                                                        | Passed, zero warnings                                                                 |
| Prettier                                                      | Passed                                                                                |
| Behavioral tests with native boundaries mocked                | 48 passed across 6 suites, covering iOS and Android adapters                          |
| Unbundled package JavaScript/declaration build                | Passed                                                                                |
| Expo Doctor                                                   | 21 of 21 checks passed                                                                |
| pnpm peer dependency check                                    | Passed                                                                                |
| Showcase Metro exports                                        | iOS and Android passed                                                                |
| Clean external consumer using the package tarball             | Installation, public types, and iOS/Android bundles passed; no peer dependency issues |

The local clean-consumer evidence is recorded in `.artifacts/consumer-verification.json` at `2026-09-29T04:37:08.602Z`, using `.artifacts/package-FBWFwC/idiom-ui-0.1.0.tgz`. These generated artifacts are untracked; rerun `pnpm verify:package` to produce a fresh record.

Native builds, device boot, Maestro execution, visual layout, and VoiceOver/TalkBack checks have not been performed in this environment.

### Native release gates

| Gate              | Required evidence                                                                             | Native status         |
| ----------------- | --------------------------------------------------------------------------------------------- | --------------------- |
| Foundation        | Development builds boot on iOS and Android                                                    | Pending               |
| First slice       | Native Screen/Section/Row/Toggle, scrolling, icons, appearance, slots, accessible interaction | Pending               |
| Complete settings | Link, read-only Value, Picker, working destinations                                           | Pending               |
| Search and polish | Text entry/clear, empty-state action, large fonts, tablets, appearance                        | Pending               |
| Release package   | Tarball installed in a clean consumer; declarations, bundles, native builds                   | Pending native builds |

Before a release, replace pending entries with the date, OS/device, SDK version, commit, and result. Keep failures visible until corrected. A successful Android run does not certify iOS.

## Automated checks

Run from the workspace root:

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

`pnpm bundle` checks both platform bundles. `pnpm verify:package` exercises the packed library in a separate consumer; its result does not establish native build success. Use `pnpm run doctor` explicitly because pnpm also has a built-in command named `doctor`.

Tests should cover both adapters' controlled state, callbacks, disabled behavior, accessible metadata, user wrappers, fragments, conditional children, and explicit slots. Include picker cancellation/current-value selection and invalid options, search clearing, and empty-state actions. Native boundaries are mocked; these tests establish JavaScript contracts only.

## Smoke flows

Install and launch a development build on a device or emulator. Start Metro with `pnpm start`; open the development build and dismiss any initial development-client overlay before running the smoke tests. Set `APP_ID` to the application's native identifier from `app.json`:

```sh
maestro test -e APP_ID=dev.vorterlune.idiom.showcase .maestro/settings.yaml
maestro test -e APP_ID=dev.vorterlune.idiom.showcase .maestro/search.yaml
maestro test -e APP_ID=dev.vorterlune.idiom.showcase .maestro/navigation.yaml
```

The flows use visible behavior and stable test IDs. Run them on each platform, resetting the app session between flows where indicated. Native menu text/focus may require platform-specific selectors; any adjustment must follow an observed accessibility hierarchy and must not weaken assertions.

The SDK 57 showcase and clean consumer enable `ios.enableSceneSupport` through `expo-build-properties` for Xcode 27/iOS 27 compatibility. Regenerate the native project and rebuild the client after changing that configuration; a JavaScript reload is insufficient. Record the Xcode and iOS versions with the run and confirm cold launch and background/foreground transitions. See [Expo's migration guidance](https://github.com/expo/fyi/blob/main/ios-scene-lifecycle.md#staying-on-sdk-57-with-xcode-27).

## Manual native matrix

| Area              | Check on both platforms                                                                                                                                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled toggle | Tap both label and control. One action produces one state change. External value changes are reflected. Disabled toggle does nothing.                                                                                                                           |
| Screen reader     | Use VoiceOver/TalkBack. Read each section and row; confirm labels, descriptions, values, disabled state, and switch state. Toggle is one coherent interaction, with no duplicate focus target or activation.                                                    |
| Picker            | Open, select another value, choose the current value, dismiss outside, and cancel/back. No callback on cancellation or reselection; disabled picker stays closed.                                                                                               |
| Controlled picker | In a consumer, ignore a change callback, then test a delayed parent update. The row label and selected-choice indicator must remain at the supplied value until the parent commits another value. Reopen the menu between attempts to catch stale native state. |
| Picker focus      | With VoiceOver/TalkBack, open the menu, inspect the selected choice, activate another option, and dismiss/cancel. Confirm option labels, selection indication, and focus returning to the preference row without a duplicate focus target.                      |
| Navigation        | Profile, Privacy, Licences, and Component lab open; system back returns to Settings and preserves in-memory preferences.                                                                                                                                        |
| Search            | Enter mixed-case text, clear using the clear control, submit, show no-results state, use its Clear search action, and dismiss the keyboard. No clipped keyboard or competing scrolling.                                                                         |
| Appearance        | Switch System/Light/Dark and change the device appearance. Text, controls, native containers, search, navigation, and status bar remain readable. Check Android dynamic color on a supported device.                                                            |
| Large text        | Use the largest accessibility font settings. Long labels/descriptions wrap, values remain readable, and controls do not overlap.                                                                                                                                |
| Touch targets     | Inspect minimum 44-point targets on iOS and 48-dp targets on Android. Read-only rows have no false button semantics.                                                                                                                                            |
| Composition       | Wrapped Section/row components, fragments, and conditional rows render in the correct section. Toggle additional details in Component lab.                                                                                                                      |
| Slots             | Inspect custom badge and search header sizing during rotation, appearance changes, and font scaling. No clipped/zero-sized React Native host.                                                                                                                   |
| Scrolling         | Reach the end of Component lab. One native vertical viewport owns scrolling; no competing nested scroll gesture.                                                                                                                                                |
| Layout            | Phone and tablet, portrait and landscape; content is centered and bounded on larger screens. Insets are correct with and without navigation headers.                                                                                                            |
| RTL               | Enable an RTL device locale and restart. Row order, alignment, icons, navigation affordances, and text input behave correctly.                                                                                                                                  |

No custom animations are introduced, so no custom reduced-motion policy is needed. Confirm native controls still behave normally when reduced motion is enabled.

## Clean-tarball release gate

Pack `@idiom/ui`, then install the tarball in a fresh supported Expo app outside the workspace. Do not add TypeScript path mappings or Metro aliases back into the repository. Import every public component and type through `@idiom/ui`; render a Screen with a wrapped Section, native controls, and a custom trailing slot.

Confirm:

1. Installation supplies all declared dependencies without a second React/React Native/native runtime.
2. TypeScript resolves declarations and preserves string-literal picker typing.
3. Metro resolves the iOS and Android internal adapters from the published entrypoint.
4. All icon assets and legal notices are included.
5. Both platform bundles build, then both native applications build and boot.
6. A toggle, picker, navigation action, and search can be used in the installed consumer.

Retain the tarball file list, command results, device evidence, and any unresolved failures with the release record. Do not publish while required native checks are pending.
