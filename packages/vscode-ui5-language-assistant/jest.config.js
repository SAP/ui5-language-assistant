const { join } = require("path");
const defaultConfig = require("../../jest.config");

module.exports = {
  ...defaultConfig,
  globals: {
    "ts-jest": {
      tsconfig: join(__dirname, "tsconfig-test.json"),
      diagnostics: {
        // warnOnly: true,
        exclude: /\.(spec|test)\.ts$/,
      },
    },
  },
  collectCoverageFrom: ["!**/*scripts"],
};
