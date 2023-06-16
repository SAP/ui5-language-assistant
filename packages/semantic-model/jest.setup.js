jest.setTimeout(300000); // 5 min

// add all jest-extended matchers
const matchers = require("jest-extended");
expect.extend(matchers);
