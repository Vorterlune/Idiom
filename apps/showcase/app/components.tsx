import { EmptyState, SearchBar, Settings } from '@idiom/ui';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ComponentsPage() {
  const [presses, setPresses] = useState(0);
  const [showDetails, setShowDetails] = useState(true);
  const [exampleSearch, setExampleSearch] = useState('');
  const [restored, setRestored] = useState(false);

  return (
    <Settings.Screen
      safeAreaEdges={['left', 'right', 'bottom']}
      testID="components-screen"
      header={
        <SearchBar
          value={exampleSearch}
          onChangeText={setExampleSearch}
          placeholder="Try the search control"
          testID="lab-search"
        />
      }
    >
      <Settings.Section
        title="Rows & slots"
        footer="The badge is ordinary React Native content in an explicit trailing slot."
      >
        <Settings.Row
          label="Run sample action"
          description={`Activated ${presses} ${presses === 1 ? 'time' : 'times'}`}
          onPress={() => setPresses((value) => value + 1)}
          testID="sample-action"
        />
        <Settings.Row
          label="Preview release"
          accessibilityLabel="Preview release, version 0.1"
          trailing={
            <View style={styles.badge}>
              <Text style={styles.badgeText}>v0.1</Text>
            </View>
          }
        />
        <Settings.Value label="Search text" value={exampleSearch || 'No text entered'} />
        <Settings.Row
          label="Unavailable action"
          description="A disabled row must never activate."
          disabled
          onPress={() => setPresses((value) => value + 1)}
          testID="disabled-row"
        />
        <Settings.Toggle
          label="Managed preference"
          description="Disabled by a sample policy"
          value
          disabled
          onValueChange={() => setPresses((value) => value + 1)}
          testID="disabled-toggle"
        />
        <Settings.Picker
          label="Managed selection"
          value="standard"
          options={[
            { label: 'Standard', value: 'standard' },
            { label: 'Custom', value: 'custom' },
          ]}
          disabled
          onValueChange={() => setPresses((value) => value + 1)}
          testID="disabled-picker"
        />
      </Settings.Section>
      <Settings.Section
        title="Composition & text"
        footer="Increase the system font size and rotate a phone or tablet to inspect wrapping and the bounded content width."
      >
        <Settings.Toggle
          label="Show additional details"
          value={showDetails}
          onValueChange={setShowDetails}
          testID="details-toggle"
        />
        <>
          {showDetails && <AdditionalDetails />}
          <Settings.Row
            label="A deliberately long preference label that should remain readable when the system text size is increased"
            description="Descriptions can also span several lines. Native typography, flexible layout, and generous touch targets should allow everyone to read the complete setting without shrinking text or relying on a fixed-height row."
          />
        </>
      </Settings.Section>
      <Settings.Section title="Empty state">
        {restored ? (
          <Settings.Row
            label="Sample item restored"
            description="The empty-state action updated application state."
            onPress={() => setRestored(false)}
            testID="restored-item"
          />
        ) : (
          <EmptyState
            title="Nothing saved yet"
            description="Restore a sample item to try the action."
            icon="document"
            action={{ label: 'Restore sample item', onPress: () => setRestored(true) }}
            testID="lab-empty"
          />
        )}
      </Settings.Section>
      <LongSection />
    </Settings.Screen>
  );
}

function AdditionalDetails() {
  return <Settings.Value label="Wrapped component" value="Visible" />;
}

function LongSection() {
  return (
    <Settings.Section title="Scrolling" footer="End of the component lab.">
      {Array.from({ length: 20 }, (_, index) => (
        <Settings.Value
          key={index}
          label={`Sample item ${index + 1}`}
          value={`Value ${index + 1}`}
        />
      ))}
    </Settings.Section>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 6, backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: '#334155', fontSize: 13, fontWeight: '600' },
});
