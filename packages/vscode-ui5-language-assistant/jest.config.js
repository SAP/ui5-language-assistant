const { join } = require("path");
const defaultConfig = require("../../jest.config");

module.exports = {
  ...defaultConfig,
  coveragePathIgnorePatterns: [
    "<rootDir>/scripts/package-vsix.js",
    "<rootDir>/src/extension.ts",
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
