const path = require("path");

const config = {
  optimization: {
    // The Default minimization options cause JavaScript runtime errors.
    // Also we don't actually need to minimize as much (not targeted for browser).
    // Rather we mostly need to reduce the number of fileSystem access requests
    // by reducing the number of files.
    minimize: false,
  },
  target: "node",
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
