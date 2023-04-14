const baseConfig = require("../../../../.mocharc.js");
module.exports = {
  ...baseConfig,
  spec: "./dist/test/unit/**/*spec.js",
};
