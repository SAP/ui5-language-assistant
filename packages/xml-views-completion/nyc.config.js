const baseConfig = require("../../nyc.config");

module.exports = {
  ...baseConfig,
  // WIP - can't test (easily) without UI5 Semantic Model mini compiler.
  branches: 0,
  lines: 0,
  functions: 0,
  statements: 0
};
