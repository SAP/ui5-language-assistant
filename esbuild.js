async function builder(options) {
  const buildConfig = {
    ...{
      logLevel: "info",
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
      target: "node14",
    },
    ...options,
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
}

module.exports = { builder };
