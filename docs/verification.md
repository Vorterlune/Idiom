# Verification record and release gates

## Current status

The initial implementation was developed on Windows; subsequent macOS and device checks are recorded below. Native iOS execution requires macOS/Xcode, and Android execution requires an Android SDK, a compatible Java runtime, and a running device or emulator. Native checks below are **pending until run and recorded**. Automated mocked tests and Metro bundle checks cannot be substituted for them.

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

At this baseline, native builds, device boot, Maestro execution, visual layout, and VoiceOver/TalkBack checks had not been performed.

### Storybook integration — 2026-10-13

Environment: macOS, Node 24.21.0, pnpm 11.19.0, the existing Expo/React Native versions above, React Native Storybook and on-device addons 10.6.2, Storybook core 10.6.1. Core 10.6.2 was inside the workspace's 24-hour minimum release age, so the compatible 10.6.1 release is pinned. Existing application dependency version ranges are unchanged.

| Check                                                            | Result                                                                                                                                                                                               |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frozen-lockfile installation and peer dependencies               | Passed; no peer issues                                                                                                                                                                               |
| Library/showcase/public-contract TypeScript and story generation | Passed, including generation before showcase typechecking                                                                                                                                            |
| ESLint and formatting                                            | Passed                                                                                                                                                                                               |
| Behavioral tests                                                 | 48 component tests and 2 script tests passed with the original timeouts; initial cold-cache tests timed out during concurrent native compilation, then passed unchanged                              |
| Normal showcase exports                                          | iOS and Android passed; source maps contain zero Storybook or story modules                                                                                                                          |
| Storybook exports                                                | iOS and Android passed; each includes all 11 story files                                                                                                                                             |
| Live Storybook index                                             | 40 stories covering all public components and composition examples                                                                                                                                   |
| Packed library in a clean external consumer                      | Installation, public types, and iOS/Android exports passed                                                                                                                                           |
| Expo Doctor                                                      | 20/21 checks passed; dependency-version check requests newer patches for seven existing Expo packages. Versions retained to keep this change scoped to Storybook                                     |
| Native builds                                                    | Xcode 27 built and installed the iOS 27 simulator app. Android debug assembly passed with JBR 21, Gradle 9.3.1, and the Expo-selected SDK/NDK; APK installed on Pixel 9 (Android 17/API 37) over USB |
| Native runtime checks                                            | Storybook and normal showcase boot on Pixel 9 and iPhone 18 Pro simulator; interaction results recorded below                                                                                        |

Bundle-source evidence and the live story index are saved locally under `.artifacts/storybook-bundles.json` and `.artifacts/storybook-index.json`. These generated artifacts are untracked. Run `pnpm bundle --source-maps`, `pnpm storybook:bundle --source-maps`, and inspect the maps to reproduce the inclusion/exclusion check.

The iOS Expo launch command timed out opening the simulator UI after a successful build/install. Opening Xcode 27's Device Hub and launching the installed app directly recovered it. With `--localhost`, Metro initially listened only on IPv6 while the simulator requested `127.0.0.1`; restarting Metro with `NODE_OPTIONS=--dns-result-order=ipv4first` restored connectivity. Switching modes in an existing iOS client session produced a blank screen even though accessibility state updated; terminating only Idiom and cold-opening Storybook restored visible rendering.

On Android, Expo targeted an emulator that was closed after assembly; installing and launching the same APK directly on the user's USB-connected Pixel succeeded. One later development-client relaunch raised `App react context shouldn't be created before`; force-stopping only Idiom and reopening the development client restored it. This occurred in Expo's native launcher before the Storybook JavaScript startup. Android runtime checks used the physical Pixel rather than an emulator.

The native smoke checks below used the uncommitted Storybook changes on top of `1cb69f2`, iPhone 18 Pro/iOS 27 in Xcode 27, and Pixel 9/Android 17 (API 37). Story changes were driven through Storybook's channel server; interactions used the simulator accessibility UI and Android USB debugging.

| Check                                               | Pixel 9                                         | iPhone 18 Pro simulator                       |
| --------------------------------------------------- | ----------------------------------------------- | --------------------------------------------- |
| Storybook launch and story switching                | Passed                                          | Passed                                        |
| Native Toggle and editable Controls value           | Passed; reset also restores the default         | Passed; reset also restores the default       |
| Callback entries in Actions                         | Passed (`onPress`)                              | Passed (`onValueChange`)                      |
| Picker selection, cancellation, disabled control    | Passed                                          | Passed                                        |
| Native Search clear                                 | Passed; Controls value also cleared             | Passed                                        |
| Search text entry and submission                    | Passed; callbacks logged and keyboard dismissed | Passed                                        |
| Disabled Toggle activation                          | Passed; label and switch leave value unchanged  | Passed; value unchanged                       |
| System/Light/Dark appearance                        | Default System and explicit Light/Dark passed   | Default System and explicit Light/Dark passed |
| Long scrolling                                      | Reached item 48 and end footer                  | Reached final rows and end footer             |
| Normal showcase launch and Component lab navigation | Passed                                          | Passed                                        |

Default phone layouts kept preview content clear of the status area and Storybook toolbar. Device appearance changes while System is selected, full VoiceOver/TalkBack use, largest font settings, RTL, rotation/tablet layouts, every story variant, and the broader release gates below were not exercised. Local Pixel screenshots and the smoke result record are under `/tmp/idiom-android-pixel-*.png` and `/tmp/idiom-android-smoke-results.json`; they are untracked.

Actions checks establish that callbacks appear in the log. Exact event counts were not established with both clients connected to the shared channel: some activations displayed two log entries. The existing automated callback-contract tests passed.

### CI dependency alignment — 2026-10-13

The first Storybook CI runs passed `pnpm check` but failed Expo Doctor's package-version check (20/21 checks). Running `pnpm run doctor` locally reproduced the same seven patch mismatches. The showcase now uses Expo 57.0.28, Expo UI 57.0.23, constants 57.0.21, development client 57.0.20, linking 57.0.12, router 57.0.26, and splash screen 57.0.10. Root Expo and Expo UI tooling use the same patches so clean-consumer verification tests the aligned versions. React 19.2.3, React Native 0.86.3, and public library peer requirements are unchanged.

With the updated lockfile, frozen installation, peer checks, `pnpm check` (48 component tests and 2 script tests), Expo Doctor (21/21), normal and Storybook iOS/Android exports, and `pnpm verify:package` passed locally. Source maps again confirm normal exports contain zero Storybook/story modules and Storybook exports include all 11 story files. The existing Doctor CI step remains enabled without exclusions or ignored failures.

The native device results above precede this patch alignment. Native builds and interaction checks have not been repeated with the new Expo patches; rebuild development clients before validating this dependency set on devices.

### Native release gates

| Gate              | Required evidence                                                                             | Native status                                         |
| ----------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Foundation        | Development builds boot on iOS and Android                                                    | Passed 2026-10-13; environments and base commit above |
| First slice       | Native Screen/Section/Row/Toggle, scrolling, icons, appearance, slots, accessible interaction | Pending                                               |
| Complete settings | Link, read-only Value, Picker, working destinations                                           | Pending                                               |
| Search and polish | Text entry/clear, empty-state action, large fonts, tablets, appearance                        | Pending                                               |
| Release package   | Tarball installed in a clean consumer; declarations, bundles, native builds                   | Pending native builds                                 |

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
