/**
 * based on https://github.com/istanbuljs/istanbuljs/blob/1fe490e51909607137ded25b1688581c9fd926cd/monorepo-merge-reports.js
 */
const { dirname, basename, join, resolve } = require("path");
const { spawnSync } = require("child_process");

const rimraf = require("rimraf");
const makeDir = require("make-dir");
const glob = require("glob");

process.chdir(resolve(__dirname, ".."));
rimraf.sync(".nyc_output");
makeDir.sync(".nyc_output");

console.log("Merging coverage from packages...");

// Merge coverage data from each package so we can generate a complete reports
glob.sync("packages/*/reports/test/unit/coverage").forEach((jestOutput) => {
  const cwd = dirname(jestOutput);
  const packageName = cwd.split("/")[1];
  console.log(packageName);

  const { status, stderr } = spawnSync(
    resolve("node_modules", ".bin", "nyc"),
    [
      "merge",
      "coverage",
      join(__dirname, "..", ".nyc_output", packageName + ".json"),
    ],
    {
      encoding: "utf8",
      shell: true,
      cwd,
    }
  );

  if (status !== 0) {
    console.error(stderr);
    process.exit(status);
  }
});

const { status, stderr } = spawnSync(
  resolve("node_modules", ".bin", "nyc"),
  ["report", "--reporter=lcov"],
  {
    encoding: "utf8",
    shell: true,
    cwd: resolve(__dirname, ".."),
  }
);

if (status !== 0) {
  console.error(stderr);
  process.exit(status);
}
