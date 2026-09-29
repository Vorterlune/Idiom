import { Settings } from '@idiom/ui';

import { usePreferences } from '../src/preferences';

export default function ProfilePage() {
  const { publicProfile, setPublicProfile } = usePreferences();

  return (
    <Settings.Screen safeAreaEdges={['left', 'right', 'bottom']} testID="profile-screen">
      <Settings.Section
        title="Your account"
        footer="This is a sample account; no data is sent to a server."
      >
        <Settings.Value icon="person" label="Name" value="Alex Morgan" />
        <Settings.Value label="Email" value="alex@example.com" />
        <Settings.Value label="Account type" value="Personal" />
      </Settings.Section>
      <Settings.Section title="Visibility">
        <Settings.Toggle
          label="Show profile in directory"
          description="Let other members discover your name and profile."
          value={publicProfile}
          onValueChange={setPublicProfile}
          testID="profile-visibility-toggle"
        />
      </Settings.Section>
    </Settings.Screen>
  );
}
