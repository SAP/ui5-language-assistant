import { BindContext, BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import {
  isCollectionValue,
  isPrimitiveValue,
  isStructureValue,
  PropertyBindingInfoTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { checkAst } from "./issue-collector";
import { getPrimitiveValueIssues } from "./check-primitive-value";
import { propertyBindingInfoElements } from "../../../definition/definition";
import { isParts, rangeToOffsetRange, typesToValue } from "../../../utils";

/**
 * Check collection value
 *
 * @param element an AST element
 * @param ignore flag to ignore checking of key or value
 */
export const checkCollectionValue = (
  context: BindContext,
  element: BindingTypes.AstElement,
  ignore = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const value = element.value;
  if (isCollectionValue(value)) {
    // check if that element is allowed to have collection value
    const bindingElement = propertyBindingInfoElements.find(
      (el) => el.name === element.key?.text
    );
    if (!ignore) {
      if (!bindingElement) {
        // should have been detected by checkKey
        return issues;
      }
      const collectionItem = bindingElement.type.find(
        (item) => item.collection
      );
      if (!collectionItem) {
        const data = typesToValue(bindingElement.type, context);
        const message = `Allowed value${
          data.length > 1 ? "s are" : " is"
        } ${data.join(" or ")}`;
        issues.push({
          issueType: BINDING_ISSUE_TYPE,
          kind: "MissMatchValue",
          message,
          offsetRange: rangeToOffsetRange(value.range),
          range: value.range ?? element.range!,
          severity: "info",
        });
        return issues;
      }
      if (value.elements.length === 0) {
        const data = typesToValue(bindingElement.type, context, true);
        const message = `Required value${
          data.length > 1 ? "s" : ""
        } ${data.join(" or ")} must be provided`;
        issues.push({
          issueType: BINDING_ISSUE_TYPE,
          kind: "MissingValue",
          message,
          offsetRange: rangeToOffsetRange(value.range ?? element.range),
          range: value.range ?? element.range!,
          severity: "info",
        });
        return issues;
      }
    }

    for (const item of value.elements) {
      if (isStructureValue(item)) {
        if (item.elements.length === 0 && isParts(element)) {
          issues.push({
            issueType: BINDING_ISSUE_TYPE,
            kind: "MissingValue",
            message: 'A valid binding property info must be provided for "{}"',
            offsetRange: rangeToOffsetRange(item.range),
            range: item.range ?? value.range ?? element.range!,
            severity: "info",
          });
        } else {
          issues.push(...checkAst(context, item, !isParts(element)));
        }
      }
      if (isCollectionValue(item) && isParts(element)) {
        issues.push({
          issueType: BINDING_ISSUE_TYPE,
          kind: "MissingValue",
          message: 'Nested "[]" are not allowed',
          offsetRange: rangeToOffsetRange(
            item.range ?? value.range ?? element.range
          ),
          range: item.range ?? value.range ?? element.range!,
          severity: "info",
        });
        return issues;
      }
      if (isPrimitiveValue(item) && !ignore) {
        issues.push(
          ...getPrimitiveValueIssues(context, item, bindingElement, true)
        );
      }
    }
  }
  return issues;
};
