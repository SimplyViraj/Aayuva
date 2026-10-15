import base from './jest.config.cjs';
// Real local database I/O/teardown exceeds unit-test startup costs on Windows.
// This fixture budget is not an application latency or production SLO.
export default { ...base, testTimeout: 30_000, testMatch: ['**/*.database.spec.ts'], testPathIgnorePatterns: ['/node_modules/'] };
