const baseConfig = require("../../nyc.config");

module.exports = {
  ...baseConfig,
  branches: 66,
  lines: 71,
  functions: 66,
  statements: 72
};
