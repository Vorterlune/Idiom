const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expo,
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { __dirname: 'readonly', __filename: 'readonly' },
    },
  },
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '.pnpm-store/**',
      'coverage/**',
      '.artifacts/**',
      '.consumer-test/**',
      'apps/showcase/android/**',
      'apps/showcase/ios/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
]);
