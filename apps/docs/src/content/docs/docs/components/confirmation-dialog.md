---
title: ConfirmationDialog
description: One native Confirm action and one Cancel action, with application-owned open state and side effects.
---

Use a confirmation for resetting preferences, deleting an item, or leaving an account session. Render it beside screen content; Idiom owns native hosting without a caller-supplied Host or trigger.

```tsx
import { useState } from 'react';
import { ConfirmationDialog, Settings } from '@idiom/ui';

export function Privacy({ resetPreferences }: { resetPreferences: () => void }) {
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <>
      <Settings.Screen title="Privacy">
        <Settings.Section title="Restore defaults">
          <Settings.Row label="Reset preferences" onPress={() => setResetOpen(true)} />
        </Settings.Section>
      </Settings.Screen>
      <ConfirmationDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset preferences?"
        message="Restore settings defaults. Your name and email will stay as they are."
        confirmLabel="Reset preferences"
        destructive
        onConfirm={resetPreferences}
      />
    </>
  );
}
```

## Props

| Prop           | Contract                                                                      |
| -------------- | ----------------------------------------------------------------------------- |
| `open`         | Required controlled boolean                                                   |
| `onOpenChange` | Required callback; accept user closure by setting `open` false                |
| `title`        | Required string                                                               |
| `confirmLabel` | Required action label                                                         |
| `onConfirm`    | Required callback; invoked once on confirmation                               |
| `message`      | Optional explanatory string                                                   |
| `cancelLabel`  | Optional; defaults to `"Cancel"`                                              |
| `destructive`  | Optional; defaults to false                                                   |
| `testID`       | Optional identifier forwarded to the adapter and `.confirm`/`.cancel` buttons |

## Closure and reopening

Confirm requests `onOpenChange(false)` **before** invoking `onConfirm`. Cancel and native dismissal request closure without running the action. Programmatically changing `open` to false emits no user callbacks.

Native alerts close when a choice is selected. Accept the closure request. Keeping `open` true will not reopen a resolved presentation on unrelated renders; a new false-to-true transition starts a fresh one. Stale and duplicate events are guarded per presentation, including after unmount.

## Action ownership

The application handles any subsequent saving, failures, progress, and navigation. Show async feedback in the application screen; this dialog does not provide an inferred promise lifecycle, global queue, or inline loading state.

The showcase reset action restores appearance, notifications, sounds, analytics, and directory visibility defaults while retaining the edited profile name and email.

## Native presentation and limits

iOS uses Expo’s SwiftUI Alert with native cancel/destructive roles. Android uses Compose AlertDialog, with the semantic error color for a destructive Confirm action.

:::caution[iOS appearance override]
On iOS 27 with Expo UI 57.0.23, the system alert follows device appearance. Provider-only dark appearance does not override its native surface. Accent overrides work. This remains an unresolved native requirement.
:::

iOS system alerts do not expose the forwarded test identifiers in the simulator accessibility tree; select native actions by label. Full VoiceOver verification and Android native checks remain incomplete. See [verification and limits](/Idiom/docs/status/verification/) for actual device evidence.

V1 covers one Confirm and one Cancel action. Arbitrary dialog content, multiple actions, promise-based confirmation hooks, and navigation guards are deferred.
