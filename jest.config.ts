import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	testPathIgnorePatterns: ['^.+.mock..+'],
	transform: {
		'^.+.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
	},
	preset: 'ts-jest',
};

export default config;
