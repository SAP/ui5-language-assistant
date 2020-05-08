import { snapshotTestLSPDiagnostic } from "../utils";
describe(`The language server diagnostics capability`, () => {
  it("Can create diagnostic for an unknown enum value", async () => {
    await snapshotTestLSPDiagnostic(__dirname);
  });
});
