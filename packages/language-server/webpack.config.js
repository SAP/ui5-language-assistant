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
};
module.exports = config;
