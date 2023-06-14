import { BINDING_ISSUE_TYPE } from "../../src/constant";
import { BindingIssue, bindingValidators, isBindingIssue } from "../../src/api";
import { defaultRange } from "../../src/utils";

describe("api", () => {
  test("bindingValidators", () => {
    expect(bindingValidators.document.length).toEqual(0);
    expect(bindingValidators.element.length).toEqual(0);
    expect(bindingValidators.attribute.length).toEqual(1);
  });
  test("isBindingIssue", () => {
    const issue: BindingIssue = {
      issueType: BINDING_ISSUE_TYPE,
      kind: "Syntax",
      message: "",
      severity: "info",
      range: defaultRange(),
    };
    expect(isBindingIssue(issue)).toBeTrue();
  });
});
