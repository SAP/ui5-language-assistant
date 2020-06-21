import { expect } from "chai";
import { getManifestSchemaConfig } from "../../src/manifestSchemaConfig";

describe("the comment field in manifest's schema configuration", () => {
  it("it must never be changed", () => {
    const expectedComment =
      "Automatic configuration for manifest.json schema - added by UI5 Language Assistant";
    const errorMessage =
      "used as a flag to allow future undo of this workaround";
    const manifestSchemaConfig = getManifestSchemaConfig();
    expect(manifestSchemaConfig.comment).to.exist;
    expect(manifestSchemaConfig.comment, `${errorMessage}`).to.equal(
      expectedComment
    );
  });
});
