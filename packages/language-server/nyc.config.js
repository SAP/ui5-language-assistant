module.exports = {
  reporter: ["text", "lcov"],
  "check-coverage": true,
  exclude: ["lib/server.js", "lib/language-services.js", "lib/ui5-model.js"],
  // https://reflectoring.io/100-percent-test-coverage/
  branches: 0,
  lines: 0,
  functions: 0,
  statements: 0
};
