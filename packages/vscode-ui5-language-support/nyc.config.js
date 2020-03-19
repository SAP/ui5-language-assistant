module.exports = {
  reporter: ["text", "lcov"],
  "check-coverage": true,
  exclude: ["lib/extension.js"],
  // https://reflectoring.io/100-percent-test-coverage/
  branches: 0,
  lines: 0,
  functions: 0,
  statements: 0
};
