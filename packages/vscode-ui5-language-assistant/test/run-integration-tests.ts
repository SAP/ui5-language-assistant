import { resolve, dirname } from "path";
import { runTests } from "vscode-test";
import globby from "globby";

async function main(): Promise<void> {
  try {
    const pkgJsonPath = resolve(__dirname, "..", "..", "package.json");

    const rootPkgFolder = dirname(pkgJsonPath);
    const testPkgFolder = resolve(rootPkgFolder, "lib", "test", "suite");

    const extensionDevelopmentPath = resolve(rootPkgFolder);

    const scenarioPaths = await globby(`${testPkgFolder}/**/index.js`);
    // Use for of + await to ensure running in sequence because vscode-test library cannot start multiple vscode instances at the same time
    for (const path of scenarioPaths) {
      await runTests({
        extensionDevelopmentPath,
        extensionTestsPath: path,
      });
    }
  } catch (err) {
    console.error("Failed to run tests: ", err);
    process.exit(1);
  }
}

main();
