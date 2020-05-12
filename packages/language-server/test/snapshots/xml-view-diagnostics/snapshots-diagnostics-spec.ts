import * as klawSync from "klaw-sync";
import { map, forEach } from "lodash";
import { basename } from "path";
import { snapshotTestLSPDiagnostic } from "./snapshots-utils";

describe(`The language server diagnostics capability`, () => {
  const snapshotTestsDir = __dirname;
  const klawItems = klawSync(snapshotTestsDir, { depthLimit: 1, nofile: true });
  const testDirs = map(klawItems, (_) => _.path);

  forEach(testDirs, (dirPath) => {
    const dirName = basename(dirPath);

    // UNCOMMENT THE LINES BELOW AND CHANGE onlyTestDirName TO ONLY RUN A SPECIFIC SNAPSHOT TEST
    // const onlyTestDirName = "my-test-dir";
    // if (dirName !== onlyTestDirName) {
    //   return;
    // }

    it("Can create diagnostic for " + dirName.replace(/-/g, " "), async () => {
      await snapshotTestLSPDiagnostic(dirPath);
    });
  });
});
