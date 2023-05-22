jest.setTimeout(60000);

// add all jest-extended matchers
const matchers = require("jest-extended");
expect.extend(matchers);
