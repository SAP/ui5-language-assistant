jest.setTimeout(6000);

// add all jest-extended matchers
const matchers = require("jest-extended");
expect.extend(matchers);
