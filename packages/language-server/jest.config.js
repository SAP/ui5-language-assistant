const { join } = require("path");
const defaultConfig = require("../../jest.config");

module.exports = {
  ...defaultConfig,
  coveragePathIgnorePatterns: [
    "<rootDir>/src/server.ts",
    "<rootDir>/scripts/update-diagnostics-snapshots.js",
  ],
  globals: {
    "ts-jest": {
      tsconfig: join(__dirname, "tsconfig-test.json"),
      diagnostics: {
        // warnOnly: true,
        exclude: /\.(spec|test)\.ts$/,
      },
    },
  },
};
