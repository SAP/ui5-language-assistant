const chai = require("chai");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");
chai.use(deepEqualInAnyOrder);

const baseConfig = require("../../../../.mocharc.js");
module.exports = {
  ...baseConfig,
  spec: "./lib/test/unit/**/*spec.js",
};
