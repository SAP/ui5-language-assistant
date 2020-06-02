module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:eslint-comments/recommended",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/no-use-before-define": [
      "error",
      { functions: false, classes: false },
    ],
    // We actually need to ignore multiple things the TypeScript Compiler cannot
    // seem to figure out by itself.
    "@typescript-eslint/ban-ts-ignore": "off",
    // This rule replaces `ban-ts-ignore` but we need to upgrade to latest major version of eslint+typescript
    // to have full configuration options for it.
    "@typescript-eslint/ban-ts-comment": "off",
    "eslint-comments/disable-enable-pair": ["error", { allowWholeFile: true }],
  },
  ignorePatterns: ["**/*.js"],
};
