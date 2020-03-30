module.exports = {
  ...require('@naturalcycles/dev-lib/cfg/jest.config'),
  globalSetup: '<rootDir>/src/test/globalSetup.ts',
  globalTeardown: '<rootDir>/src/test/globalTeardown.ts',
}
