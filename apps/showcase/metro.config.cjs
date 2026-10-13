const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/withStorybook');
const path = require('node:path');

module.exports = withStorybook(getDefaultConfig(__dirname), {
  configPath: path.resolve(__dirname, '.rnstorybook'),
});
