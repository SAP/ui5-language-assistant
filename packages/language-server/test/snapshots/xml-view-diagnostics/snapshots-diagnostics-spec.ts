import klawSync from "klaw-sync";
import { map, forEach, filter } from "lodash";
import { basename, relative, dirname } from "path";
import {
  snapshotTestLSPDiagnostic,
  toSourcesTestDir,
  INPUT_FILE_NAME,
} from "./snapshots-utils";

describe(`The language server diagnostics capability`, () => {
  // The test files are in the source dir, not lib
  const snapshotTestsDir = toSourcesTestDir(__dirname);
  const klawItems = klawSync(snapshotTestsDir, { nodir: true });
  const inputFiles = filter(klawItems, (item) => {
    return item.path.endsWith(INPUT_FILE_NAME);
  });
  const testDirs = map(inputFiles, (_) => dirname(_.path));

  forEach(testDirs, (dirPath) => {
    const dirName = basename(dirPath);

    // UNCOMMENT THE LINES BELOW AND CHANGE onlyTestDirName TO ONLY RUN A SPECIFIC SNAPSHOT TEST
    // const onlyTestDirName = "my-test-dir";
    // if (dirName !== onlyTestDirName) {
    //   return;
    // }

    it(`Can create diagnostic for ${dirName.replace(/-/g, " ")} (${relative(
      snapshotTestsDir,
      dirPath
    )})`, async () => {
      await snapshotTestLSPDiagnostic(dirPath);
    });
  });
});
