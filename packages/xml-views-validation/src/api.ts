import { Context } from "@ui5-language-assistant/context";
import { XMLDocument, accept } from "@xml-tools/ast";
import { UI5XMLViewIssue, Validators } from "../api";
import { UI5ValidatorsConfig, ValidatorVisitor } from "./validate-xml-views";
import {
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

export { defaultValidators } from "./validators";

export const validators: Validators = {
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
};

export function validateXMLView<T = UI5XMLViewIssue>(opts: {
  validators: UI5ValidatorsConfig<T>;
  context: Context;
  xmlView: XMLDocument;
}): T[] {
  const validatorVisitor = new ValidatorVisitor(opts.context, opts.validators);
  accept(opts.xmlView, validatorVisitor);
  const issues = validatorVisitor.collectedIssues;
  return issues;
}

export type { UI5ValidatorsConfig } from "./validate-xml-views";

export { isPossibleBindingAttributeValue } from "../src/utils/is-binding-attribute-value";
