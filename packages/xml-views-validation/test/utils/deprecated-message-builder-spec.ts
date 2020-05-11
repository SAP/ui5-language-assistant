import { expect } from "chai";
import { buildUI5DeprecatedInfo } from "@ui5-language-assistant/test-utils/";
import { buildDeprecatedIssueMessage } from "../../src/utils/deprecated-message-builder";

describe("the deprecated message builder", () => {
  it("can build a message with only the prefix", () => {
    const deprecatedInfo = buildUI5DeprecatedInfo({});

    const actualMessage = buildDeprecatedIssueMessage({
      ui5Kind: "Class",
      fqn: "osem.Bisli",
      deprecatedInfo,
    });
    expect(actualMessage).to.eql("UI5 Class osem.Bisli is deprecated.");
  });

  it("can build a message with both the prefix and the `since` info", () => {
    const deprecatedInfo = buildUI5DeprecatedInfo({
      since: "6.6.6",
    });

    const actualMessage = buildDeprecatedIssueMessage({
      ui5Kind: "Class",
      fqn: "osem.Bisli",
      deprecatedInfo,
    });
    expect(actualMessage).to.eql(
      "UI5 Class osem.Bisli is deprecated since version: 6.6.6."
    );
  });
});
