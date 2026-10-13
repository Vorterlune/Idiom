import { Settings } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';

import { appearanceArgs, appearanceArgTypes, type HarnessArgs } from './harness';

type Args = HarnessArgs & { showDetails: boolean };

function WrappedDetails() {
  return <Settings.Value label="Wrapped component" value="Visible" />;
}

const meta = {
  title: 'Examples/Composition',
  args: { ...appearanceArgs, showDetails: true },
  argTypes: { ...appearanceArgTypes, showDetails: { control: 'boolean' } },
  render: function Render() {
    const [{ showDetails }, updateArgs] = useArgs<Args>();
    return (
      <Settings.Screen title="Composition" safeAreaEdges={[]}>
        <Settings.Section
          title="Fragments and wrapped components"
          footer="React components return native settings content directly."
        >
          <>
            <Settings.Row label="Inside a fragment" icon="info" />
            <WrappedDetails />
          </>
        </Settings.Section>
        <Settings.Section title="Conditional rows">
          <Settings.Toggle
            label="Show additional details"
            value={showDetails}
            onValueChange={(value) => {
              updateArgs({ showDetails: value });
              action('showDetails.onValueChange')(value);
            }}
          />
          {showDetails ? <WrappedDetails /> : null}
        </Settings.Section>
      </Settings.Screen>
    );
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FragmentsAndConditionalRows: Story = {};
export const LongScrolling: Story = {
  render: () => (
    <Settings.Screen title="Scrolling" safeAreaEdges={[]}>
      {Array.from({ length: 4 }, (_, section) => (
        <Settings.Section
          key={section}
          title={`Group ${section + 1}`}
          footer={
            section === 3 ? 'End of the scrolling example.' : 'Scroll to inspect the next group.'
          }
        >
          {Array.from({ length: 12 }, (_, row) => (
            <Settings.Value
              key={row}
              label={`Sample item ${section * 12 + row + 1}`}
              value={`Value ${row + 1}`}
            />
          ))}
        </Settings.Section>
      ))}
    </Settings.Screen>
  ),
};
