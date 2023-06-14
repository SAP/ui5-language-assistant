jest.setTimeout(420000); // 7 min

// add all jest-extended matchers
const matchers = require("jest-extended");
expect.extend(matchers);
