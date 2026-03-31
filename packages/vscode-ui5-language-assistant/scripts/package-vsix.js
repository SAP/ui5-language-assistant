/**
 * Simplified VSIX packaging script for pnpm.
 * Uses vsce CLI directly with --no-dependencies flag.
 */
const { execSync } = require("child_process");
const { resolve } = require("path");
const { readFileSync, writeFileSync, copyFileSync } = require("fs");
const { writeJsonSync, copySync, emptyDirSync } = require("fs-extra");

const rootExtDir = resolve(__dirname, "..");
const pkgJsonPath = resolve(rootExtDir, "package.json");

// Read & save the original literal representation of the pkg.json
const pkgJsonOrgStr = readFileSync(pkgJsonPath, "utf8");
const pkgJson = JSON.parse(pkgJsonOrgStr);

// During development the `main` points to compiled source
// During production it should point to bundled source
if (pkgJson.main !== "./dist/extension") {
  pkgJson.main = "./dist/extension";
  writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2, EOL: "\n" });
}

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
const reuseDirExtPath = resolve(rootExtDir, ".reuse");
emptyDirSync(reuseDirExtPath);
copySync(reuseDirPath, reuseDirExtPath);

try {
  // Use local vsce installation with minimatch 9.0.5 compatibility
  // Run vsce directly from node_modules to use package-local dependencies
  console.log("Packaging extension with vsce...");
  const vscePath = resolve(rootExtDir, "node_modules", ".bin", "vsce");
  execSync(`"${vscePath}" package --no-dependencies`, {
    cwd: rootExtDir,
    stdio: "inherit",
  });
  console.log("✓ VSIX package created successfully");
} catch (error) {
  console.error("✗ Failed to create VSIX package:", error.message);
  process.exitCode = 1;
} finally {
  // Revert changes to package.json to ensure clean git working directory
  writeFileSync(pkgJsonPath, pkgJsonOrgStr);
}
