jest.setTimeout(360000); // 6 min

// add all jest-extended matchers
const matchers = require("jest-extended");
expect.extend(matchers);
