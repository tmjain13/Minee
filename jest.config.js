/** @type {import('jest').Config} */
export default {
  projects: [
    // ── Project 1: Firestore security rules (runs in Node against the emulator) ──
    {
      displayName: 'firestore-rules',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/firestore.rules.test.ts'],
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          { tsconfig: { module: 'commonjs', jsx: 'react-jsx' } },
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      // Emulator round-trips are slower than unit tests
      testTimeout: 20000,
    },

    // ── Project 2: Standard React component tests (runs in jsdom) ──
    {
      displayName: 'components',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/**/*.test.ts',
        '<rootDir>/src/**/*.test.tsx',
        '<rootDir>/tests/components/**/*.test.ts',
        '<rootDir>/tests/components/**/*.test.tsx',
      ],
      // Never let the rules test leak into the jsdom project
      testPathIgnorePatterns: ['<rootDir>/tests/firestore.rules.test.ts'],
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          { tsconfig: { module: 'commonjs', jsx: 'react-jsx' } },
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.cjs',
        '\\.(png|jpg|jpeg|gif|svg|webp|woff2?)$':
          '<rootDir>/tests/__mocks__/fileMock.cjs',
      },
      setupFilesAfterEach: undefined,
      setupFilesAfterEach_note: undefined,
      setupFilesAfterEachRemoved: undefined,
    },
  ],
};
