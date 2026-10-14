---
title: Appearance and composition
description: Use local appearance preferences, safe areas, reusable sections, and explicit RN slots.
---

## IdiomProvider

`IdiomProvider` requires `children`. Optional `appearance` is `system`, `light`, or `dark`, defaulting to `system`; `accentColor` is an optional string.

```tsx
<SafeAreaProvider>
  <IdiomProvider appearance="system" accentColor="#663ad8">
    <Preferences />
  </IdiomProvider>
</SafeAreaProvider>
```

Place it above all affected Idiom components. Native Hosts receive the local preferences. Your application still owns navigation and status-bar appearance.

:::caution[Confirmation appearance]
The iOS system alert currently follows device appearance even when the provider requests dark. The [ConfirmationDialog page](/Idiom/docs/components/confirmation-dialog/#native-presentation-and-limits) records the limitation.
:::

## Reusable sections

Ordinary React composition works: fragments, conditional children, and wrappers do not need registration or metadata arrays.

```tsx
function AccountSection({ openProfile }: { openProfile: () => void }) {
  return (
    <Settings.Section title="Account">
      <Settings.Link icon="person" label="Profile" onPress={openProfile} />
    </Settings.Section>
  );
}

<Settings.Screen title="Settings">
  <AccountSection openProfile={openProfile} />
  {showDiagnostics && (
    <Settings.Section title="Diagnostics">
      <Settings.Value label="Storage" value="Session only" />
    </Settings.Section>
  )}
</Settings.Screen>;
```

Keep native row-to-section relationships intact. Avoid arbitrary RN layout wrappers between native rows and sections.

## Custom RN content

`Settings.Screen.header` is RN content above the scrolling viewport. `Settings.Row.trailing` is a display-only RN slot with one measured root.

```tsx
<Settings.Row label="Plan" accessibilityLabel="Plan, Pro" trailing={<Text>Pro</Text>} />
```

Include meaningful accessory content in the row’s accessible label. A display slot must not create another interactive or independently accessible control within an interactive row. Use a Toggle, Picker, or separate Row for interaction.

Forms uses a separate interactive bridge for editable fields. Its text inputs retain their own editable accessibility elements.

## What stays in the application

- Controlled state, validation rules, and when errors appear.
- Permission requests, persistence, server calls, and retry policies.
- Navigation, unsaved-change decisions, and status-bar appearance.
- Application-owned safe-area setup.

Use Expo UI directly when a screen needs controls or layouts beyond Idiom’s patterns. Read the [semantic-layer explanation](/Idiom/docs/concepts/semantic-layer/) for the tradeoffs.
