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
    "@models/(.*)$": ["<rootDir>/src/models/$1"],
    "@routes/(.*)$": ["<rootDir>/src/routes/$1"],
    "@serializer/(.*)$": ["<rootDir>/src/serializer/$1"],
    "@middlewares/(.*)$": ["<rootDir>/src/middlewares/$1"],
    "@libs/(.*)$": ["<rootDir>/src/libs/$1"],
    "@controllers/(.*)$": ["<rootDir>/src/controllers/$1"],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  collectCoverage: true,
  clearMocks: true,
  coverageDirectory: "coverage",
};
