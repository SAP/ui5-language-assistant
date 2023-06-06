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
import {
  isParts,
  rangeToOffsetRange,
  typesToValue,
  findRange,
} from "../../../utils";
import { checkComma } from "./check-comma";

/**
 * Check collection value
 *
 * @param element an AST element
 * @param ignore flag to ignore checking of key or value
 */
export const checkCollectionValue = (
  context: BindContext,
  element: BindingTypes.AstElement,
  errors: {
    parse: BindingTypes.ParseError[];
    lexer: BindingTypes.LexerError[];
  },
  ignore = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const value = element.value;
  if (!isCollectionValue(value)) {
    return issues;
  }
  // filter undefined
  const elements = value.elements.filter((item) => !!item);
  if (ignore) {
    // do not check key - process collection value
    for (let index = 0; elements.length > index; index++) {
      const item = elements[index];
      const nextItem = elements[index + 1];
      if (isStructureValue(item)) {
        issues.push(...checkAst(context, item, errors, !isParts(element)));
      }
      if (isPrimitiveValue(item)) {
        issues.push(...getPrimitiveValueIssues(context, item, undefined, true));
      }
      issues.push(...checkComma(item, value.commas, errors, nextItem));
    }
    return issues;
  }
  // check if that element is allowed to have collection value
  const bindingElement = propertyBindingInfoElements.find(
    (el) => el.name === (element.key && element.key.text)
  );

  if (!bindingElement) {
    // should have been detected by checkKey
    return issues;
  }
  const collectionItem = bindingElement.type.find((item) => item.collection);
  if (!collectionItem) {
    const data = typesToValue(bindingElement.type, context);
    /* istanbul ignore next */
    const message = `Allowed value${
      data.length > 1 ? "s are" : " is"
    } ${data.join(" or ")}`;
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissMatchValue",
      message,
      offsetRange: rangeToOffsetRange(findRange([value.range, element.range])),
      range: findRange([value.range, element.range]),
      severity: "info",
    });
    return issues;
  }

  if (elements.length === 0) {
    const data = typesToValue(bindingElement.type, context, true);
    const message = `Required value${data.length > 1 ? "s" : ""} ${data.join(
      " or "
    )} must be provided`;
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissingValue",
      message,
      offsetRange: rangeToOffsetRange(findRange([value.range, element.range])),
      range: findRange([value.range, element.range]),
      severity: "info",
    });
    return issues;
  }

  for (let index = 0; elements.length > index; index++) {
    const item = elements[index];
    const nextItem = elements[index + 1];
    if (isStructureValue(item)) {
      if (item.elements.length === 0 && isParts(element)) {
        issues.push({
          issueType: BINDING_ISSUE_TYPE,
          kind: "MissingValue",
          message: 'A valid binding property info must be provided for "{}"',
          offsetRange: rangeToOffsetRange(item.range),
          range: findRange([item.range, value.range, element.range]),
          severity: "info",
        });
      } else {
        issues.push(...checkAst(context, item, errors, !isParts(element)));
      }
    }
    if (isCollectionValue(item) && isParts(element)) {
      issues.push({
        issueType: BINDING_ISSUE_TYPE,
        kind: "MissingValue",
        message: 'Nested "[]" are not allowed',
        offsetRange: rangeToOffsetRange(
          findRange([item.range, value.range, element.range])
        ),
        range: findRange([item.range, value.range, element.range]),
        severity: "info",
      });
      return issues;
    }
    if (isPrimitiveValue(item)) {
      issues.push(
        ...getPrimitiveValueIssues(context, item, bindingElement, true)
      );
    }
    issues.push(...checkComma(item, value.commas, errors, nextItem));
  }
  return issues;
};
