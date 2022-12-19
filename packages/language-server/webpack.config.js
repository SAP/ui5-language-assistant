const path = require("path");
const baseConfig = require("../../webpack.config.base");

const config = {
  ...baseConfig,
  entry: "./lib/src/server.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "server.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  module: {
    rules: [
      {
        test: /module-loader\.js$/,
        loader: "string-replace-loader",
        options: {
          search: "require.resolve",
          replace: "__non_webpack_require__.resolve",
        },
      },
    ],
  },
};
module.exports = config;
