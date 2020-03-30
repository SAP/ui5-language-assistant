/* istanbul ignore file */
/**
 * Workaround to: https://github.com/microsoft/vscode-vsce/issues/300
 * This "sorts of" implements the (broken) `yarn list` with support for workspaces
 * by hot-patching VSCE cli tool in combination with yarn's workspaces `nohoist` option.
 *
 * See code comments for details.
 *
 * Possible disadvantages:
 * - Some dev-Deps may be included in the VSIX.
 * - Some dev artifacts (e.g coverage reports) may be included in the VSIX.
 * - Need to ensure assumptions this logic relies on, (e.g nohoist configuration details).
 * - Could break when VSCE dep version changes.
 */
const proxyquire = require("proxyquire");
const { expect } = require("chai");
const { filter, map, includes, keys, forEach } = require("lodash");
const { resolve, join, sep, basename } = require("path");
const { existsSync } = require("fs");
const glob = require("glob");

const extensionRootPkg = require("../package.json");
const monoRepoRootPkg = require("../../../package.json");

const extName = extensionRootPkg.name;
const extDeps = keys(extensionRootPkg.dependencies);
const monoRepoNoHoist = monoRepoRootPkg.workspaces.nohoist;

// ensure nohoist is configured correctly so all the dependencies (including transitive)
// of the VSCode extension would be present in the extensions's **own** node_modules dir.
// - https://classic.yarnpkg.com/blog/2018/02/15/nohoist/
forEach(extDeps, _ => {
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

const rootPkgDir = resolve(__dirname, "..");
const allFolders = glob.sync("**/", {
  cwd: rootPkgDir,
  realpath: true
});

const onlyProductiveRootNpmPackages = filter(allFolders, _ => {
  return (
    // We are simulating the behavior of `npm ls`, which prints only packages names.
    // - But with monorepo support.
    // - https://docs.npmjs.com/cli/ls
    existsSync(resolve(_, "package.json")) &&
    // Avoid bundling none productive packages from this mono repo.
    !includes(_, "test-packages")
  );
});

// Dependencies from this mono repo get resolved to their **real** path,
// basically the symbolic link gets expended.
// However need we need link that is relative to the extension's `node_modules`
// to enable re-building the `node_modules` inside the vsix archive.
const extFolderName = basename(rootPkgDir);
const scopeName = require("../../language-server/package").name.split("/")[0];
const relativeToExtRootReplacer = [
  "packages",
  extFolderName,
  "node_modules",
  scopeName,
  "$<pkgName>"
].join(sep);

// Transform paths to other packages in this mono-repo so the paths will contain the symlinks in the extensions's `node_modules` dir.
// - From:  ...\ui5-language-assistant\packages\language-server
// - To:    ...\ui5-language-assistant\packages\vscode-ui5-language-assistant\node_modules\@ui5-language-assistant\language-server
const onlyProductiveRootNpmPackagesRelativeToRoot = map(
  onlyProductiveRootNpmPackages,
  _ => {
    if (!includes(_, join("packages", extFolderName, "node_modules"))) {
      // we replace ui5-language-assistant
      return _.replace(
        /packages[\\\/](?<pkgName>[-\w]+)/,
        relativeToExtRootReplacer
      );
    } else {
      return _;
    }
  }
);

// **Hot-Patching** VSCE using proxyquire.
const getDepsStub = {
  getDependencies: async () =>
    onlyProductiveRootNpmPackagesRelativeToRoot.concat([rootPkgDir])
};
const { packageCommand } = proxyquire("vsce/out/package", {
  "./npm": getDepsStub
});

packageCommand({
  cwd: rootPkgDir,
  packagePath: undefined,
  baseContentUrl: undefined,
  baseImagesUrl: undefined,
  useYarn: true,
  ignoreFile: undefined,
  expandGitHubIssueLinks: undefined
});
