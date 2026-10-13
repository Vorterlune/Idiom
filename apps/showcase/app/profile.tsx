import { Settings } from '@idiom/ui';
import { useRouter } from 'expo-router';

import { usePreferences } from '../src/preferences';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, publicProfile, setPublicProfile } = usePreferences();

  return (
    <Settings.Screen safeAreaEdges={['left', 'right', 'bottom']} testID="profile-screen">
      <Settings.Section
        title="Your account"
        footer="This is a sample account; no data is sent to a server."
      >
        <Settings.Value icon="person" label="Name" value={profile.name} />
        <Settings.Value label="Email" value={profile.email} />
        <Settings.Value label="Account type" value="Personal" />
        <Settings.Link
          label="Edit profile"
          onPress={() => router.push('/profile-edit')}
          testID="edit-profile-link"
        />
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
