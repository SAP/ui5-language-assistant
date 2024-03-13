const { join } = require("path");
const defaultConfig = require("../../jest.config");

module.exports = {
  ...defaultConfig,
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!scripts/**/*.{ts,js}"],
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
