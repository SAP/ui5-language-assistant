const { join } = require("path");
const { builder } = require("../../esbuild");

builder({
  outfile: "dist/server.js",
  entryPoints: [join(process.cwd(), "src/server.ts")],
});
