import { ActionSheet, Settings } from '@idiom/ui';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { usePreferences } from '../src/preferences';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, publicProfile, setPublicProfile } = usePreferences();
  const anchorRef = useRef<View>(null);
  const [actionsOpen, setActionsOpen] = useState(false);

  return (
    <>
      <Settings.Screen
        safeAreaEdges={['left', 'right', 'bottom']}
        testID="profile-screen"
        header={
          <Pressable
            ref={anchorRef}
            collapsable={false}
            accessibilityRole="button"
            style={styles.trigger}
            onPress={() => setActionsOpen(true)}
            testID="profile-actions-trigger"
          >
            <Text style={styles.triggerLabel}>Profile actions</Text>
          </Pressable>
        }
      >
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
      <ActionSheet
        open={actionsOpen}
        onOpenChange={setActionsOpen}
        anchorRef={anchorRef}
        title="Profile actions"
        testID="profile-actions-sheet"
        actions={[
          { id: 'edit', label: 'Edit profile', onPress: () => router.push('/profile-edit') },
          {
            id: 'visibility',
            label: publicProfile ? 'Hide profile from directory' : 'Show profile in directory',
            onPress: () => setPublicProfile(!publicProfile),
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignSelf: 'flex-start',
    margin: 16,
    padding: 12,
    backgroundColor: '#315da8',
    borderRadius: 10,
  },
  triggerLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
