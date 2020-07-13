import { resolve, basename, relative, dirname } from "path";
import klawSync from "klaw-sync";
import { map, forEach, filter } from "lodash";
import { existsSync } from "fs-extra";
import {
  snapshotTestLSPDiagnostic,
  toSourcesTestDir,
  INPUT_FILE_NAME,
  LSPDiagnosticOptions,
} from "./snapshots-utils";

describe(`The language server diagnostics capability`, () => {
  // The test files are in the source dir, not lib
  const snapshotTestsDir = toSourcesTestDir(__dirname);
  const klawItems = klawSync(snapshotTestsDir, { nodir: true });
  const inputFiles = filter(klawItems, (item) => {
    return item.path.endsWith(INPUT_FILE_NAME);
  });
  const testDirs = map(inputFiles, (_) => dirname(_.path));

  forEach(testDirs, async (dirPath) => {
    const dirName = basename(dirPath);

    // UNCOMMENT THE LINES BELOW AND CHANGE onlyTestDirName TO ONLY RUN A SPECIFIC SNAPSHOT TEST
    // const onlyTestDirName = "my-test-dir";
    // if (dirName !== onlyTestDirName) {
    //   return;
    // }
    const optionsPath = resolve(dirPath, "options.js");
    let options: LSPDiagnosticOptions;
    if (existsSync(optionsPath)) {
      options = require(optionsPath);
    } else {
      options = { flexEnabled: false };
    }

    it(`Can create diagnostic for ${dirName.replace(/-/g, " ")} (${relative(
      snapshotTestsDir,
      dirPath
    )})`, async () => {
      await snapshotTestLSPDiagnostic(dirPath, options);
    });
  });
});
