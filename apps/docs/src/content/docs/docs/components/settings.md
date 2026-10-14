---
title: Settings
description: Compose native preferences with sections, toggles, pickers, links, and values.
---

Import the family through `@idiom/ui`. Keep values controlled by your application and render rows inside a section and screen.

```tsx
import { useState } from 'react';
import { Settings } from '@idiom/ui';

const appearances = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
] as const;

export function Preferences({ openProfile }: { openProfile: () => void }) {
  const [notifications, setNotifications] = useState(true);
  const [appearance, setAppearance] = useState<'system' | 'light' | 'dark'>('system');

  return (
    <Settings.Screen title="Settings">
      <Settings.Section title="Preferences" footer="You can change these at any time.">
        <Settings.Toggle
          icon="notifications"
          label="Notifications"
          description="Receive important updates"
          value={notifications}
          onValueChange={setNotifications}
        />
        <Settings.Picker
          icon="appearance"
          label="Appearance"
          value={appearance}
          options={appearances}
          onValueChange={setAppearance}
        />
      </Settings.Section>
      <Settings.Section title="Account">
        <Settings.Link icon="person" label="Profile" onPress={openProfile} />
        <Settings.Value label="Version" value="0.1.0" />
      </Settings.Section>
    </Settings.Screen>
  );
}
```

The picker above changes a preference value. To apply appearance, feed that value into an enclosing `IdiomProvider`; see [appearance](/Idiom/docs/guides/appearance-and-composition/).

## Components

| Component          | Required props                               | Optional props                                       |
| ------------------ | -------------------------------------------- | ---------------------------------------------------- |
| `Settings.Screen`  | `children`                                   | `title`, RN `header`, `safeAreaEdges`, `testID`      |
| `Settings.Section` | `children`                                   | `title`, `footer`, `testID`                          |
| `Settings.Row`     | `label`                                      | Shared row props, `onPress`, display-only `trailing` |
| `Settings.Toggle`  | `label`, `value`, `onValueChange`            | Shared row props                                     |
| `Settings.Picker`  | `label`, `value`, `options`, `onValueChange` | Shared row props                                     |
| `Settings.Link`    | `label`, `onPress`                           | Shared row props                                     |
| `Settings.Value`   | `label`, `value`                             | Shared row props                                     |

Shared row props: `description`, `icon`, `disabled`, `accessibilityLabel`, `accessibilityHint`, and `testID`. See the exact [public types](/Idiom/docs/reference/public-api/).

## Controlled values

Callbacks request a change. Your application commits that change by updating `value`. If it ignores or delays a picker callback, both the row and selected choice continue to reflect the controlled value.

Picker option values must be unique and include the current value. Cancelling or choosing the current value emits no value-change callback. Disabled controls do not activate.

## Semantic icons

Supported names are `person`, `notifications`, `appearance`, `sound`, `privacy`, `info`, `document`, and `search`. Idiom maps them to SF Symbols on iOS and Material Symbols on Android.

## Scrolling and composition

Settings owns one native scrolling viewport. Render fragments, conditional rows, and reusable sections with ordinary React composition; do not add a competing vertical scroll container or arbitrary React Native wrappers between native rows and their native section.

Use `header` for RN content above the scrolling settings and `trailing` for display-only row accessories. Interactive controls belong in their own settings component.
