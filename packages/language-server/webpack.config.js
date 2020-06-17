const path = require("path");

const config = {
  target: "node",
  entry: "./lib/src/server.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "server.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  devtool: "source-map",
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
