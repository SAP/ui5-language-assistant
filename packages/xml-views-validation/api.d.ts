import { XMLDocument } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";

export function validateXMLView(opts: {
  model: UI5SemanticModel;
  xmlView: XMLDocument;
}): UI5XMLViewIssue[];

export interface BaseUI5XMLViewIssue {
  kind: string;
  message: string;
  severity: "hint" | "info" | "warn" | "error";
  /*
   * An identical issue be present at multiple locations in the same XMLView
   */
  offsetRanges: OffsetRange[];
}

export interface OffsetRange {
  start: number;
  end: number;
}

export type UI5XMLViewIssue = UnknownEnumValueIssue | UseOfDeprecatedClassIssue;

// A sub-interface per issue type may seem redundant, but this allows
// a sub-issue type to have additional properties (if needed) in the future.
export interface UnknownEnumValueIssue extends BaseUI5XMLViewIssue {
  kind: "UnknownEnumValue";
}

export interface UseOfDeprecatedClassIssue extends BaseUI5XMLViewIssue {
  kind: "UseOfDeprecatedClass";
}
