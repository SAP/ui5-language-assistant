jest.setTimeout(120000); // 2 min

// add all jest-extended matchers
const matchers = require("jest-extended");
expect.extend(matchers);
