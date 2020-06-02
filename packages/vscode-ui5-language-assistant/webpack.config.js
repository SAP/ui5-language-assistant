const path = require("path");

const config = {
  // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  target: "node",
  // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  entry: "./lib/src/extension.js",
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  devtool: "source-map",
  // 📖 -> https://webpack.js.org/configuration/externals/
  externals: {
    // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed.
    vscode: "commonjs vscode",
    // the language-server must be bundled separately as it is executed in a separate process (by path).
    "@ui5-language-assistant/language-server":
      "commonjs @ui5-language-assistant/language-server",
  },
  resolve: {
    // Solution for resolution inside mono-repo
    modules: [
      path.resolve(__dirname, "node_modules"),
      path.resolve(__dirname, "../node_modules"),
      "node_modules",
    ],
    extensions: [".js"],
  },
};

module.exports = config;
