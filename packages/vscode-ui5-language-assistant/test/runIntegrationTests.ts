import { resolve, dirname } from "path";
import { runTests } from "vscode-test";
import globby from "globby";

async function main(): Promise<void> {
  try {
    const pkgJsonPath = require.resolve(
      "vscode-ui5-language-assistant/package.json"
    );
    const rootPkgFolder = dirname(pkgJsonPath);
    const testPkgFolder = resolve(rootPkgFolder, "lib", "test", "suite");

    const extensionDevelopmentPath = resolve(rootPkgFolder);

    const scenarioPaths = await globby(`${testPkgFolder}/**/index.js`);
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
