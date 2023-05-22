/**
 * Different ESLint rules used for tests source code.
 */
module.exports = {
  rules: {
    // casts to <any> are used when constructing (partially valid) UI5 Semantic model nodes.
    "@typescript-eslint/no-explicit-any": ["off"],
  },
};
