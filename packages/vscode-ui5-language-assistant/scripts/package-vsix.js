const proxyquire = require("proxyquire");
const { resolve } = require("path");
const { readFileSync, writeFileSync, copyFileSync } = require("fs");
const { writeJsonSync, copySync, emptyDirSync } = require("fs-extra");

// The path to the language server must be resolved from **inside** the VSCode Ext's node_modules.
const langServerDir = resolve(
  __dirname,
  "..",
  "node_modules",
  "@ui5-language-assistant",
  "language-server",
);

const rootExtDir = resolve(__dirname, "..");
const getDepsStub = {
  getDependencies: async () => [rootExtDir, langServerDir],
};
const { packageCommand } = proxyquire("@vscode/vsce/out/package", {
  "./npm": getDepsStub,
});

const pkgJsonPath = resolve(rootExtDir, "package.json");
// Read & save the original literal representation of the pkg.json
// To avoid dealing with re-formatting (prettier) later on.
const pkgJsonOrgStr = readFileSync(pkgJsonPath, "utf8");
const pkgJson = JSON.parse(pkgJsonOrgStr);
// During development flows the `main` should point to the compiled sourced
// for fast dev feedback loops.
// During production flows the main should point to the bundled sources
// to reduce loading time.
pkgJson.main = "./dist/extension";
writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2, EOF: "\n" });

// Ensure License and copyright related files are part of the packaged .vsix
const rootMonoRepoDir = resolve(__dirname, "..", "..", "..");
const licenseRootMonoRepoPath = resolve(rootMonoRepoDir, "LICENSE");
const licenseExtPath = resolve(rootExtDir, "LICENSE");
copyFileSync(licenseRootMonoRepoPath, licenseExtPath);

const licensesDirPath = resolve(rootMonoRepoDir, "LICENSES");
const licensesDirExtPath = resolve(rootExtDir, "LICENSES");
emptyDirSync(licensesDirExtPath);
copySync(licensesDirPath, licensesDirExtPath);

const reuseDirPath = resolve(rootMonoRepoDir, ".reuse");
const reuseDirExtPath = resolve(rootExtDir, "LICENSES");
emptyDirSync(reuseDirExtPath);
copySync(reuseDirPath, reuseDirExtPath);

// Time to create the VSIX.
packageCommand({
  cwd: rootExtDir,
  packagePath: undefined,
  baseContentUrl: undefined,
  baseImagesUrl: undefined,
  useYarn: true,
  ignoreFile: undefined,
  expandGitHubIssueLinks: undefined,
})
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1000;
  })
  .finally(() => {
    const fs = require("fs");

    // revert changes to the pkg.json, ensure clean git working directory
    writeFileSync(pkgJsonPath, pkgJsonOrgStr);
  });
