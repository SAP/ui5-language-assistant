const { join } = require("path");

const buildConfig = {
  logLevel: "info",
  outfile: "dist/server.js",
  entryPoints: [join(process.cwd(), "src/server.ts")],
  write: true,
  format: "cjs",
  bundle: true,
  metafile: true,
  sourcemap: true, // .vscodeignore ignores .map files when bundling!!
  mainFields: ["module", "main"], // https://stackoverflow.com/a/69352281
  minify: true,
  loader: {
    ".jpg": "file",
    ".gif": "file",
    ".mp4": "file",
    ".graphql": "text",
    ".png": "file",
    ".svg": "file",
  },
  platform: "node",
  target: "node12.22",
};

if (process.argv.slice(2).includes("--watch")) {
  console.log("Applyin watch config");
  buildConfig.watch = true;
  buildConfig.minify = false;
}

require("esbuild")
  .build(buildConfig)
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
