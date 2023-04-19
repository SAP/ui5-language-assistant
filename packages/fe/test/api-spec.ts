import { UI5XMLViewIssue } from "@ui5-language-assistant/xml-views-validation";
import { expect } from "chai";
import { AnnotationIssue, ANNOTATION_ISSUE_TYPE } from "../src/types";
import { isAnnotationIssue, defaultValidators } from "../src/api";

describe("fe api", () => {
  it("is AnnotationIssue", () => {
    const result = isAnnotationIssue({
      kind: "AnnotationPathRequired",
      issueType: ANNOTATION_ISSUE_TYPE,
    } as AnnotationIssue | UI5XMLViewIssue);
    expect(result).to.be.true;
  });
  it("is not AnnotationIssue", () => {
    const result = isAnnotationIssue({
      kind: "NonUniqueIDIssue",
    } as AnnotationIssue | UI5XMLViewIssue);
    expect(result).to.be.false;
  });

  it("validators", () => {
    const validators = defaultValidators;
    expect(validators.attribute.length).to.equal(6);
  });
});
