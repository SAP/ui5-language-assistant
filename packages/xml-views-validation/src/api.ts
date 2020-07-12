import { cloneDeep } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { XMLDocument } from "@xml-tools/ast";
import { UI5XMLViewIssue } from "../api";
import { validateXMLView as validateXMLViewImpl } from "./validate-xml-views";
import { allValidators } from "./validators";
import { validateNonStableId } from "./validators/elements/non-stable-id";

export function validateXMLView(opts: {
  model: UI5SemanticModel;
  xmlView: XMLDocument;
  flexEnabled: boolean;
}): UI5XMLViewIssue[] {
  const actualValidators = cloneDeep(allValidators);
  if (opts.flexEnabled) {
    actualValidators.element.push(validateNonStableId);
  }

  return validateXMLViewImpl({ validators: actualValidators, ...opts });
}
