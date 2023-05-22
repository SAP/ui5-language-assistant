import {
  buildUI5DeprecatedInfo,
  buildUI5Model,
  buildUI5Class,
  buildUI5Namespace,
} from "@ui5-language-assistant/test-utils/";
import { buildDeprecatedIssueMessage } from "../../../src/utils/deprecated-message-builder";

describe("the deprecated message builder", () => {
  const model = buildUI5Model({});
  const osem = buildUI5Namespace({ name: "osem" });

  it("can build a full message with 'since' and 'details'", () => {
    const ui5Class = buildUI5Class({
      parent: osem,
      name: "Bisli",
      deprecatedInfo: buildUI5DeprecatedInfo({
        text: "use osem.Bamba instead.",
        since: "6.6.6",
      }),
    });

    const actualMessage = buildDeprecatedIssueMessage({
      symbol: ui5Class,
      model,
    });
    expect(actualMessage).toBe(
      "The osem.Bisli class is deprecated since version 6.6.6. use osem.Bamba instead."
    );
  });

  it("can build a message with only the prefix", () => {
    const ui5Class = buildUI5Class({
      parent: osem,
      name: "Bisli",
      deprecatedInfo: buildUI5DeprecatedInfo({}),
    });

    const actualMessage = buildDeprecatedIssueMessage({
      symbol: ui5Class,
      model,
    });
    expect(actualMessage).toEqual("The osem.Bisli class is deprecated.");
  });

  it("can build a message with only the prefix and the `since` info", () => {
    const ui5Class = buildUI5Class({
      parent: osem,
      name: "Bisli",
      deprecatedInfo: buildUI5DeprecatedInfo({
        since: "6.6.6",
      }),
    });

    const actualMessage = buildDeprecatedIssueMessage({
      symbol: ui5Class,
      model,
    });
    expect(actualMessage).toEqual(
      "The osem.Bisli class is deprecated since version 6.6.6."
    );
  });

  it("can build a message with only the prefix and the `details` info", () => {
    const ui5Class = buildUI5Class({
      parent: osem,
      name: "Bisli",
      deprecatedInfo: buildUI5DeprecatedInfo({
        text: "use osem.Bamba instead.",
      }),
    });

    const actualMessage = buildDeprecatedIssueMessage({
      symbol: ui5Class,
      model,
    });
    expect(actualMessage).toEqual(
      "The osem.Bisli class is deprecated. use osem.Bamba instead."
    );
  });
});
