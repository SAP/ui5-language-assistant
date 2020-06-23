/* istanbul ignore file */
/**
 * Workaround to: https://github.com/microsoft/vscode-vsce/issues/300
 * This "sorts of" implements the (broken) `yarn list` with support for workspaces
 * by hot-patching VSCE cli tool in combination with yarn's workspaces `nohoist` option.
 *
 * See code comments for details.
 *
 * Possible disadvantages:
 * - Some dev artifacts (e.g coverage reports) may be included in the VSIX.
 * - Need to ensure assumptions this logic relies on, (e.g nohoist configuration details).
 * - Could break when VSCE dep version changes.
 */
const proxyquire = require("proxyquire");
const { expect } = require("chai");
const { resolve } = require("path");
const { forEach } = require("lodash");
const { readFileSync, writeFileSync, copyFileSync } = require("fs");
const { writeJsonSync } = require("fs-extra");

const extensionRootPkg = require("../package.json");
const monoRepoRootPkg = require("../../../package.json");

const extName = extensionRootPkg.name;
const monoRepoNoHoist = monoRepoRootPkg.workspaces.nohoist;

// ensure nohoist is configured correctly so the `language-server` dependency
// of the VSCode extension would be present in the extensions's **own** node_modules dir.
// - https://classic.yarnpkg.com/blog/2018/02/15/nohoist/
forEach(["@ui5-language-assistant/language-server"], (_) => {
  // Shallow
  expect(
    monoRepoNoHoist,
    `Add "${extName}/${_}" to root monorepo package.json[workspaces.nohoist]`
  ).to.include(`${extName}/${_}`);
  // Transitive
  expect(
    monoRepoNoHoist,
    `Add "${extName}/${_}/**" to root monorepo package.json[workspaces.nohoist]`
  ).to.include(`${extName}/${_}/**`);
});

// The path to the language server must be resolved from **inside** the VSCode Ext's node_modules.
const langServerDir = resolve(
  __dirname,
  "..",
  "node_modules",
  "@ui5-language-assistant",
  "language-server"
);

// **Hot-Patching** VSCE using proxyquire.
const rootExtDir = resolve(__dirname, "..");
const getDepsStub = {
  getDependencies: async () => [rootExtDir, langServerDir],
};
const { packageCommand } = proxyquire("vsce/out/package", {
  "./npm": getDepsStub,
});

const pkgJsonPath = resolve(rootExtDir, "package.json");
// Read & save the original literal representation of the pkg.json
// To avoid dealing with re-formatting (prettier) later on.
const pkgJsonOrgStr = readFileSync(pkgJsonPath, "utf8");
const pkgJson = JSON.parse(pkgJsonOrgStr);
// During development flows the `main` should point to the compiled sourced
// for fast dev feedback loops.
expect(pkgJson.main).to.equal("./lib/src/extension");
// During production flows the main should point to the bundled sources
// to reduce loading time.
pkgJson.main = "./dist/extension";
writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2, EOF: "\n" });

// Ensure License an Notice files are part of the packaged .vsix
const rootMonoRepoDir = resolve(__dirname, "..", "..", "..");
const noticeRootMonoRepoPath = resolve(rootMonoRepoDir, "NOTICE");
const licenseRootMonoRepoPath = resolve(rootMonoRepoDir, "LICENSE");
const noticeExtPath = resolve(rootExtDir, "NOTICE");
const licenseExtPath = resolve(rootExtDir, "LICENSE");
copyFileSync(noticeRootMonoRepoPath, noticeExtPath);
copyFileSync(licenseRootMonoRepoPath, licenseExtPath);

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
    process.exitCode = 666;
  })
  .finally(() => {
    // revert changes to the pkg.json, ensure clean git working directory
    writeFileSync(pkgJsonPath, pkgJsonOrgStr);
  });
