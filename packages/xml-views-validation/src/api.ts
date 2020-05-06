import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { XMLDocument } from "@xml-tools/ast";
import { UI5XMLViewIssue } from "../api";
import { validateXMLView as validateXMLViewImpl } from "./validate-xml-views";
import { allValidators } from "./validators";

export function validateXMLView(opts: {
  model: UI5SemanticModel;
  xmlView: XMLDocument;
}): UI5XMLViewIssue[] {
  return validateXMLViewImpl({ validators: allValidators, ...opts });
}
