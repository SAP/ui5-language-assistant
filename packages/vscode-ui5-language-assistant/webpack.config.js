const path = require("path");
const baseConfig = require("../../webpack.config.base");

const config = {
  ...baseConfig,
  entry: "./lib/src/extension.js",
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  // 📖 -> https://webpack.js.org/configuration/externals/
  externals: {
    // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed.
    vscode: "commonjs vscode",
    // the language-server must be bundled separately as it is executed in a separate process (by path).
    "@ui5-language-assistant/language-server":
      "commonjs @ui5-language-assistant/language-server",
  },
};

module.exports = config;
