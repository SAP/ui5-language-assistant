import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { expect } from "chai";
import { restore, stub } from "sinon";
import * as appContext from "../src/context";

describe("context", () => {
  afterEach(() => {
    restore();
  });
  it("getContextForFile", async () => {
    stub(appContext, "getUI5Model").resolves(
      ("stubUi5Model" as unknown) as UI5SemanticModel
    );
    const result = await appContext.getContextForFile("a/b/c");
    expect(result).to.deep.equal({
      manifest: undefined,
      ui5Model: "stubUi5Model",
    });
  });
});
