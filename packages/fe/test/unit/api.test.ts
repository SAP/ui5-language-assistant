import { UI5XMLViewIssue } from "@ui5-language-assistant/xml-views-validation";

import { AnnotationIssue, ANNOTATION_ISSUE_TYPE } from "../../src/types";
import { isAnnotationIssue, defaultValidators } from "../../src/api";

describe("fe api", () => {
  it("is AnnotationIssue", () => {
    const result = isAnnotationIssue({
      kind: "AnnotationPathRequired",
      issueType: ANNOTATION_ISSUE_TYPE,
    } as AnnotationIssue | UI5XMLViewIssue);
    expect(result).toBeTrue();
  });
  it("is not AnnotationIssue", () => {
    const result = isAnnotationIssue({
      kind: "NonUniqueIDIssue",
    } as AnnotationIssue | UI5XMLViewIssue);
    expect(result).toBeFalse();
  });

  it("validators", () => {
    const validators = defaultValidators;
    expect(validators.attribute.length).toEqual(6);
  });
});
