# Contributing to Idiom

Idiom expresses application intent through platform-native behavior. Start with a semantic use case and reproduce it in the showcase. Keep platform-specific details internal, public types small, and state controlled by the application.

## Setup

Use Node 24, enable Corepack, and install with the pnpm version pinned in `package.json`:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm start
```

Use `pnpm android` with a configured Android development environment, or `pnpm ios` on macOS with Xcode. The first build generates native projects; those directories should remain untracked. Commit the lockfile when dependency versions change.

The showcase opts into `ios.enableSceneSupport: true` through `expo-build-properties`. Expo SDK 57 needs this setting when building with Xcode 27 for iOS 27. Keep it in the app configuration, regenerate the native iOS project through Expo prebuild after changing it, and rebuild the development client; reloading JavaScript does not apply the native lifecycle change. Preserve any manual native edits before regeneration. See [Expo's SDK 57 scene-lifecycle guidance](https://github.com/expo/fyi/blob/main/ios-scene-lifecycle.md#staying-on-sdk-57-with-xcode-27).

## Making a change

1. Add or update the smallest relevant showcase example.
2. Verify Expo APIs against the installed version's source and official documentation. Prefer universal primitives; add an adapter only for a demonstrated gap.
3. Add behavioral tests when a change affects state, events, composition, or accessibility contracts. Mock only native boundaries. A mock must not reproduce an implementation bug and then certify it as correct.
4. Run `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, and `pnpm build`.
5. Test native behavior on both platforms for changes involving hosting, controls, layout, appearance, or accessibility. Record checks that could not be performed.
6. Update the public API documentation and [verification record](docs/verification.md) when applicable.

Use `pnpm format` to format a change. Keep independent components cohesive, avoid `any`, and do not add generic styling props or dependency layers without a concrete consumer need.

## Native acceptance

Run the Maestro smoke flows and the manual matrix in [verification](docs/verification.md). Inspect the accessibility tree and test actual screen-reader operation; role assertions in JavaScript cannot prove native announcements or focus behavior.

A component is not complete solely because the TypeScript compiler accepts a native prop. Verify that each control receives its controlled value, emits a single change, and respects disabled state on the device.

## Releases

Every release requires a clean-tarball consumer check outside this workspace, including public imports, declarations, both platform bundles, and actual iOS/Android native builds. Do not rely on workspace aliases: they can conceal missing files, unlisted dependencies, or broken package exports. Retain the output and environment details alongside the release verification record.

Native checks that remain pending block a validated release. Publishing to npm or app stores is a separate action requiring maintainer authorization and confirmation of npm scope ownership.

Contributions are licensed under the repository's MIT licence. Retain third-party licence notices and do not bundle proprietary Apple assets.
