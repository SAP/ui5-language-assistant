import { resolve, dirname } from "path";
import { runTests } from "vscode-test";

async function main(): Promise<void> {
  try {
    const pkgJsonPath = require.resolve("ui5-language-support/package.json");
    const rootPkgFolder = dirname(pkgJsonPath);

    const extensionDevelopmentPath = resolve(rootPkgFolder);
    const extensionTestsPath = resolve(
      rootPkgFolder,
      "lib",
      "test",
      "suite",
      "index"
    );
    const extensionTestWorkspace = resolve(
      rootPkgFolder,
      "test",
      "testFixture"
    );

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [extensionTestWorkspace, "--disable-extensions"]
    });
  } catch (err) {
    console.error("Failed to run tests: ", err);
    process.exit(1);
  }
}

main();
