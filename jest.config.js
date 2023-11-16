module.exports = {
  roots: ["<rootDir>"],
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "@repositories/(.*)$": ["<rootDir>/src/repositories/*"],
    "@service/(.*)$": ["<rootDir>/src/service/*"],
    "@middleware/(.*)$": ["<rootDir>/src/middleware/*"],
    "@models/(.*)$": ["<rootDir>/src/models/*"],
    "@controllers/(.*)$": ["<rootDir>/src/controllers/*"],
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
