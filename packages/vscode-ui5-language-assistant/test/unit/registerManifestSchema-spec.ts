import { expect } from "chai";
import { getManifestSchemaConfigEntry } from "../../src/manifestSchemaConfig";

/**
 * fileMatch / comment values used to **identify** workspace settings
 * that have been automatically added by this vscode extension.
 */
describe("the manifest schema entry configuration", () => {
  it("file match must never be changed", () => {
    const manifestSchemaConfig = getManifestSchemaConfigEntry();
    expect(manifestSchemaConfig.fileMatch).to.exist;
    expect(manifestSchemaConfig.fileMatch).to.have.length(1);
    expect(manifestSchemaConfig.fileMatch[0]).to.equal("manifest.json");
  });

  it("comment must never be changed", () => {
    const expectedComment =
      "Automatic configuration for manifest.json schema - added by UI5 Language Assistant";
    const manifestSchemaConfig = getManifestSchemaConfigEntry();
    expect(manifestSchemaConfig.comment).to.exist;
    expect(manifestSchemaConfig.comment).to.equal(expectedComment);
  });
});
