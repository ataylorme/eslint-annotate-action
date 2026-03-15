export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**', '!./src/__tests__/**'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageReporters: ['json-summary', 'text', 'lcov'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js'],
  preset: 'ts-jest',
  resolver: 'ts-jest-resolver',
  setupFiles: ['./jest.env-setup.ts'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        useESM: true,
      },
    ],
  },
  verbose: true,
}
