const chai = require("chai");
const deepEqualInAnyOrder = require("deep-equal-in-any-order");
const sinonChai = require("sinon-chai");
chai.use(deepEqualInAnyOrder);
chai.use(sinonChai);

module.exports = {
  require: ["source-map-support/register"],
  spec: "./lib/test/**/*spec.js",
  // we have many async tests which depend on lazily generating the model
  timeout: 8000,
};
