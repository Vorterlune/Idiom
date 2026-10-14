import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vorterlune.github.io',
  base: '/Idiom',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Idiom',
      description: 'Native application patterns for React Native, built on Expo UI.',
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Vorterlune/Idiom' }],
      editLink: { baseUrl: 'https://github.com/Vorterlune/Idiom/edit/main/apps/docs/' },
      customCss: ['./src/styles/custom.css'],
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      expressiveCode: { themes: ['github-light', 'github-dark'] },
      sidebar: [
        { label: 'Overview', slug: 'index' },
        {
          label: 'Start here',
          items: [
            { label: 'Quick start', slug: 'docs/quick-start' },
            { label: 'Installation', slug: 'docs/installation' },
            { label: 'Expo UI comparison', slug: 'docs/guides/expo-comparison' },
          ],
        },
        {
          label: 'Components',
          items: [
            { label: 'Settings', slug: 'docs/components/settings' },
            { label: 'Forms', slug: 'docs/components/forms' },
            { label: 'ConfirmationDialog', slug: 'docs/components/confirmation-dialog' },
            { label: 'ActionSheet', slug: 'docs/components/action-sheet' },
            { label: 'SearchBar & EmptyState', slug: 'docs/components/search-and-empty-state' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Appearance & composition', slug: 'docs/guides/appearance-and-composition' },
            { label: 'Showcase & Storybook', slug: 'docs/guides/showcase-and-storybook' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Public types', slug: 'docs/reference/public-api' },
            { label: 'Semantic layer', slug: 'docs/concepts/semantic-layer' },
            { label: 'Architecture', slug: 'docs/concepts/architecture' },
            { label: 'Verification & limits', slug: 'docs/status/verification' },
          ],
        },
      ],
    }),
  ],
});
