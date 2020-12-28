const baseConfig = require("../../../../.mocharc.js");
module.exports = {
  ...baseConfig,
  spec: "./lib/test/unit/**/*spec.js",
};
