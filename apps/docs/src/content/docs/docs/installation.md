---
title: Installation
description: Package availability, supported peers, safe areas, and native setup.
---

## Package availability

The v0.1 implementation is in the repository. The npm package is **not published**. Build and pack it locally, then install the printed tarball path in your Expo application. Do not use an npm registry install command for `@idiom/ui` yet.

```sh
pnpm build
pnpm --filter @idiom/ui pack
```

## Supported peers

The library declares these peer ranges in [its package manifest](https://github.com/Vorterlune/Idiom/blob/main/packages/ui/package.json):

| Dependency        | Supported range |
| ----------------- | --------------- |
| Expo              | `^57.0.25`      |
| Expo UI           | `~57.0.20`      |
| React             | `^19.2.3`       |
| React Native      | `^0.86.0`       |
| Safe-area context | `>=5.6.0 <6`    |

The showcase currently pins compatible Expo 57.0.28 and Expo UI 57.0.23 patches. The package supplies its Material Symbols dependency. Keep one compatible React and native runtime in the application.

## Native development build

Install native peers using Expo’s installer and rebuild the development client. The native showcase and Storybook require development builds; browser rendering and Expo Go are not supported showcase targets.

For Expo SDK 57 with Xcode 27/iOS 27, install `expo-build-properties` and enable scene support:

```sh
npx expo install expo-build-properties
```

```json title="app.json"
{
  "expo": {
    "plugins": [["expo-build-properties", { "ios": { "enableSceneSupport": true } }]]
  }
}
```

Merge this into your existing plugin list, then regenerate and rebuild the native app. A JavaScript reload cannot apply this native lifecycle setting. Preserve manual native changes before regenerating. See [Expo’s SDK 57 guidance](https://github.com/expo/fyi/blob/main/ios-scene-lifecycle.md#staying-on-sdk-57-with-xcode-27).

## Safe areas and navigation

Applications own their `SafeAreaProvider`. Idiom never inserts one implicitly. Put it above screens, and put any `IdiomProvider` above all Idiom content that should receive its preferences.

By default, screen components handle all four safe-area edges. If your navigator handles the top inset, use:

```tsx
<Settings.Screen safeAreaEdges={['left', 'right', 'bottom']}>{/* Sections */}</Settings.Screen>
```

A screen title is content, not a navigation header. Keep your existing router; `Settings.Link` calls the `onPress` handler you supply.

## Verify the packed package

```sh title="In the Idiom repository"
pnpm verify:package
```

This installs a tarball in a clean external consumer and checks types plus iOS/Android bundles. Native builds and device behavior require separate checks in the [verification record](/Idiom/docs/status/verification/).
