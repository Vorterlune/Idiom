---
title: ActionSheet
description: Present native choices from an existing React Native trigger.
---

`ActionSheet` presents several application actions through an iOS system action dialog or an Android Material bottom sheet. Supply controlled open state and an existing trigger reference; Idiom owns hosting, cancellation, destructive presentation, and duplicate-event guards.

## Usage

```tsx
import { ActionSheet } from '@idiom/ui';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export function ProfileActions({
  editProfile,
  hideProfile,
}: {
  editProfile: () => void;
  hideProfile: () => void;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<View>(null);

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        ref={anchorRef}
        collapsable={false}
        accessibilityRole="button"
        onPress={() => setOpen(true)}
      >
        <Text>Profile actions</Text>
      </Pressable>
      <ActionSheet
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchorRef}
        title="Profile actions"
        actions={[
          { id: 'edit', label: 'Edit profile', onPress: editProfile },
          { id: 'hide', label: 'Hide profile from directory', onPress: hideProfile },
        ]}
      />
    </View>
  );
}
```

## Trigger and placement

Render the sheet beside screen content, within the same native window as the trigger. Reference the measurable native view backing an accessible React Native trigger, such as `Pressable`, and keep it mounted. `collapsable={false}` ensures the view remains measurable. The overlay adds no layout space and does not intercept background touches while closed.

For a Settings screen, place a React Native trigger in its `header` slot. Do not wrap native Settings rows in arbitrary React Native views to obtain a reference; those rows do not expose a measurable trigger ref. A parent with transforms or clipping is unsuitable for the overlay; place it at the screen level.

Idiom measures trigger and overlay coordinates in the same window and updates the anchor after rotation. An unavailable or zero-size iOS trigger suppresses presentation and produces a development warning. Fix the trigger and close/reopen to start a fresh presentation. Android does not use anchor geometry.

## Actions and cancellation

Supply at least one action with a unique, stable `id`, text `label`, and `onPress`. `disabled` and `destructive` default to `false`. Invalid action lists produce a development warning and suppress presentation. Disabled actions cannot resolve a choice. Android keeps disabled buttons visible; the observed iOS 27 system dialog omits disabled choices. Set `destructive: true` to request native destructive styling; it does not add another confirmation automatically.

An enabled action requests `onOpenChange(false)` before running its latest handler once. Cancel, swipe, backdrop dismissal, and Android Back only request closure. `cancelLabel` defaults to `"Cancel"`. Programmatic closure and unmounting emit no user callbacks.

Accept closure by setting `open` to false. If the request is ignored, the resolved sheet stays closed through unrelated renders. Set `open` false, then true, to reopen. Callback dispatch does not wait for the dismissal animation to finish; applications own asynchronous work, progress, failures, navigation, and further confirmations. V1 does not coordinate nested modal transitions or provide a queue.

## Platform presentation and appearance

iOS uses Expo's SwiftUI `ConfirmationDialog`; this differs from Idiom's existing two-choice `ConfirmationDialog`, which uses a centered alert. Native presentation adapts to the OS and size class: the observed iOS 27 iPhone and iPad both use trigger-anchored popovers without a visible Cancel action. Outside dismissal remains available. The system can reorder actions according to their roles. Actions are text-only. Android retains the supplied order, uses full-width buttons, and scrolls overflowing content.

The native host receives `IdiomProvider` appearance and accent settings. On the observed iPadOS 27/Expo UI 57.0.23 build, a provider-only dark override changes the story canvas but leaves the native popover following the device's light appearance. The wrapper does not change global application appearance. Check the [verification record](/Idiom/docs/status/verification/) for actual device results and remaining limitations.

`testID` supplies `${testID}.action.${id}` action identifiers and `${testID}.cancel`. iOS system dialogs may not expose these identifiers; native automation should use observed button labels when necessary. Native accessibility, focus restoration, tablet layout, and appearance require device checks.
