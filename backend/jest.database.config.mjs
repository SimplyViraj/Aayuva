import base from './jest.config.cjs';
export default { ...base, testMatch: ['**/*.database.spec.ts'], testPathIgnorePatterns: ['/node_modules/'] };
