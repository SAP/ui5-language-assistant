import { snapshotTestLSPDiagnostic } from "../snapshots-utils";
describe(`The language server diagnostics capability`, () => {
  it("Can create diagnostic for an invaid boolean value", async () => {
    await snapshotTestLSPDiagnostic(__dirname);
  });
});
