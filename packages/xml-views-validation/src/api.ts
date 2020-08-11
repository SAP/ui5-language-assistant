import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { XMLDocument, accept } from "@xml-tools/ast";
import { UI5XMLViewIssue } from "../api";
import { UI5Validators, ValidatorVisitor } from "./validate-xml-views";

export {
  defaultValidators,
  validateUnknownEnumValue,
  validateUnknownXmlnsNamespace,
  validateBooleanValue,
  validateUseOfDeprecatedClass,
  validateUseOfDeprecatedAggregation,
  validateUseOfDeprecatedAttribute,
  validateNonUniqueID,
  validateUnknownAttributeKey,
  validateUnknownTagName,
  validateExplicitAggregationCardinality,
  validateAggregationType,
  validateNonStableId,
} from "./validators";

export function validateXMLView(opts: {
  validators: UI5Validators;
  model: UI5SemanticModel;
  xmlView: XMLDocument;
}): UI5XMLViewIssue[] {
  const validatorVisitor = new ValidatorVisitor(opts.model, opts.validators);
  accept(opts.xmlView, validatorVisitor);
  const issues = validatorVisitor.collectedIssues;
  return issues;
}
