const shared = {
  rootDir: __dirname,
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: ['<rootDir>/packages/ui/__tests__/**/*.test.ts?(x)'],
  moduleNameMapper: {
    '^@idiom/ui$': '<rootDir>/packages/ui/src/index.ts',
    '^@expo/ui$': '<rootDir>/test/universal.tsx',
    '^@expo/ui/swift-ui$': '<rootDir>/test/swift-ui.tsx',
    '^@expo/ui/swift-ui/modifiers$': '<rootDir>/test/swift-modifiers.ts',
    '^@expo/ui/jetpack-compose$': '<rootDir>/test/compose.tsx',
    '^@expo/ui/jetpack-compose/modifiers$': '<rootDir>/test/compose-modifiers.ts',
    '^@expo/material-symbols/.*\\.xml$': '<rootDir>/test/material-symbols.ts',
  },
};

module.exports = {
  projects: [
    { ...shared, preset: 'jest-expo/ios', displayName: 'ios' },
    { ...shared, preset: 'jest-expo/android', displayName: 'android' },
  ],
};
