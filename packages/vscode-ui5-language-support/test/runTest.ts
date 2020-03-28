import { resolve } from "path";
import { runTests } from "vscode-test";

async function main(): Promise<void> {
  try {
    const extensionTestsEnv = {
      path: resolve(__dirname, "suite")
    };
    const extensionDevelopmentPath = resolve(__dirname, "..", "..");
    const extensionTestsPath = resolve(__dirname, "suite", "index");

    await runTests({
      extensionTestsEnv,
      extensionDevelopmentPath,
      extensionTestsPath
    });
  } catch (err) {
    console.error("Failed to run tests");
    process.exit(1);
  }
}

main();
