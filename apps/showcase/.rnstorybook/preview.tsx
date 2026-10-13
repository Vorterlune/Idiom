import type { Preview } from '@storybook/react-native';

import { withIdiom } from '../stories/harness';

const preview: Preview = {
  decorators: [withIdiom],
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: {
        order: ['Settings', 'SearchBar', 'EmptyState', 'IdiomProvider', 'Examples'],
      },
    },
  },
};

export default preview;
