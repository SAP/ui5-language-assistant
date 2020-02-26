module.exports = {
  reporter: ["text", "lcov"],
  "check-coverage": true,
  // TODO: all:true is preferred, could someone get it working properly? :)
  // - https://github.com/istanbuljs/nyc#selecting-files-for-coverage
  all: false,
  // https://reflectoring.io/100-percent-test-coverage/
  branches: 100,
  lines: 100,
  functions: 100,
  statements: 100
};
