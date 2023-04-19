const { join } = require("path");
const { builder } = require("../../esbuild");

builder({
  outfile: "dist/extension.js",
  entryPoints: [join(process.cwd(), "src/extension.ts")],
  external: [
    "vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    "@prettier/plugin-xml",
    "prettier",
  ],
});
