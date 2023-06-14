const { join } = require("path");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  automock: false,
  errorOnDeprecated: true,
  notify: false,
  notifyMode: "failure",
  verbose: false,
  testMatch: ["**/unit/**/?(*.)+(test).ts"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testResultsProcessor: "jest-sonar-reporter",
  collectCoverage: true,
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  coverageDirectory: "reports/test/unit/coverage",
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  modulePathIgnorePatterns: [
    "<rootDir>/dist/",
    "<rootDir>/node_modules/",
    "<rootDir>/test/unit/samples/",
    "<rootDir>/test/int/test-data/",
    "<rootDir>/test/int/test-data-copy/",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/lib/",
  ],
  transformIgnorePatterns: ["<rootDir>/node_modules/", "/node_modules/"],
  reporters: ["default", "summary"],
  setupFilesAfterEnv: ["../../jest.setup.js"],
};
