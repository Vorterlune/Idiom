import { ConfirmationDialog, Settings } from '@idiom/ui';
import { useState } from 'react';

import { usePreferences } from '../src/preferences';

export default function PrivacyPage() {
  const { analytics, setAnalytics, resetPreferences } = usePreferences();
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <>
      <Settings.Screen safeAreaEdges={['left', 'right', 'bottom']} testID="privacy-screen">
        <Settings.Section
          title="Your choices"
          footer="These controls demonstrate local state. The showcase does not collect analytics or request notification permissions."
        >
          <Settings.Toggle
            icon="privacy"
            label="Share usage analytics"
            description="Help improve the experience by sharing anonymous usage information."
            value={analytics}
            onValueChange={setAnalytics}
            testID="analytics-toggle"
          />
          <Settings.Value label="Data storage" value="Session only" />
        </Settings.Section>
        <Settings.Section title="Transparency">
          <Settings.Row
            icon="info"
            label="You control your preferences"
            description="Closing and restarting the app restores the sample defaults. Idiom leaves persistence and account policies to your application."
          />
        </Settings.Section>
        <Settings.Section title="Restore defaults">
          <Settings.Row
            label="Reset preferences"
            description="Restore settings defaults while keeping your name and email."
            onPress={() => setResetOpen(true)}
            testID="reset-preferences-action"
          />
        </Settings.Section>
      </Settings.Screen>
      <ConfirmationDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset preferences?"
        message="Restore notification, sound, appearance, analytics, and directory visibility settings to their defaults. Your name and email will stay as they are."
        confirmLabel="Reset preferences"
        destructive
        onConfirm={resetPreferences}
        testID="reset-preferences-dialog"
      />
    </>
  );
}
