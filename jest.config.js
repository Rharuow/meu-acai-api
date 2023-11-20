module.exports = {
  roots: ["<rootDir>"],
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "@repositories/(.*)$": ["<rootDir>/src/repositories/$1"],
    "@services/(.*)$": ["<rootDir>/src/services/$1"],
    "@middlewares/(.*)$": ["<rootDir>/src/middlewares/$1"],
    "@models/(.*)$": ["<rootDir>/src/models/$1"],
    "@libs/(.*)$": ["<rootDir>/src/libs/$1"],
    "@controllers/(.*)$": ["<rootDir>/src/controllers/$1"],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  collectCoverage: true,
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
  clearMocks: true,
  coverageDirectory: "coverage",
};
