import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts", "**/*.test.ts"],
  moduleFileExtensions: ["ts", "js"],
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/index.ts",
    "!src/**/*.d.ts"
  ],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@/application/(.*)$": "<rootDir>/src/application/$1",
    "^@/infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@/interfaces/(.*)$": "<rootDir>/src/interfaces/$1"
  }
};

export default config;