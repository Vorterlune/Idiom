import { registerRootComponent } from 'expo';

import { view } from './storybook.requires';

const StorybookUI = view.getStorybookUI({
  shouldPersistSelection: false,
});

// Storybook supplies the safe-area and gesture providers for its canvas.
registerRootComponent(StorybookUI);

export default StorybookUI;
