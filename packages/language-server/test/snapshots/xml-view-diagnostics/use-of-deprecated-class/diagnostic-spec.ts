import { snapshotTestLSPDiagnostic } from "../utils";
describe(`The language server diagnostics capability`, () => {
  it("Can create diagnostic for use of deprecated class", async () => {
    await snapshotTestLSPDiagnostic(__dirname);
  });
});
