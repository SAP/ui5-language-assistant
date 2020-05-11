import { snapshotTestLSPDiagnostic } from "../snapshots-utils";
describe(`The language server diagnostics capability`, () => {
  it("Can create diagnostic for an unknown namespace in xmlns attribute value", async () => {
    await snapshotTestLSPDiagnostic(__dirname);
  });
});
