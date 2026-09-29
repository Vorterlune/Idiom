import { Settings } from '@idiom/ui';

import { usePreferences } from '../src/preferences';

export default function PrivacyPage() {
  const { analytics, setAnalytics } = usePreferences();

  return (
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
    </Settings.Screen>
  );
}
