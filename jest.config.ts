import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	testPathIgnorePatterns: ['^.+mock.+', '^.*__coverage__/.*', '^.*__mocks__/.*'],
	transform: {
		'^.+.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
	},
	preset: 'ts-jest',
	collectCoverageFrom: ['src/**'],
	coveragePathIgnorePatterns: ['^.+index.ts$'],
	coverageDirectory: '__tests__/__coverage__',
};

export default config;
