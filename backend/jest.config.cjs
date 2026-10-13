module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '\\.database\\.spec\\.ts$'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  clearMocks: true,
  restoreMocks: true,
  // Prisma's generated TS uses emitted .js specifiers. Resolve source files in
  // Jest without modifying generated client code; compiled Node keeps .js paths.
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/generated/**'],
};
