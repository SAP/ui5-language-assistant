import { resolve } from "path";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { runTests } from "vscode-test";
import globby from "globby";

async function main(): Promise<void> {
  try {
    const extensionDevelopmentPath = resolve(__dirname, "..", "..");
    const testPkgFolder = resolve(
      extensionDevelopmentPath,
      "lib",
      "test",
      "suite"
    );

    const scenarioPaths = await globby(`${testPkgFolder}/**/index.js`);
    // Use for of + await to ensure running in sequence because vscode-test library cannot start multiple vscode instances at the same time
    for (const path of scenarioPaths) {
      // console.warn(
      //   `SKIPPING TEST: ${path}.\nsee: https://github.com/SAP/ui5-language-assistant/issues/342`
      // );
      await runTests({
        extensionDevelopmentPath,
        extensionTestsPath: path,
        launchArgs: ["--disable-extensions"],
      });
    }
  } catch (err) {
    console.error("Failed to run tests: ", err);
    process.exit(1);
  }
}

main();
