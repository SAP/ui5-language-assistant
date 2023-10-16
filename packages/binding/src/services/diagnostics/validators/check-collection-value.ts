import {
  BindContext,
  BindingIssue,
  BINDING_ISSUE_TYPE,
  BindingInfoElement,
} from "../../../types";
import {
  isCollectionValue,
  isPrimitiveValue,
  isStructureValue,
  BindingParserTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { checkAst } from "./issue-collector";
import { getPrimitiveValueIssues } from "./check-primitive-value";
import { getBindingElements } from "../../../definition/definition";
import { isParts, typesToValue, findRange } from "../../../utils";
import { checkComma } from "./check-comma";
import { checkBrackets } from "./check-brackets";

/**
 * Check collection value
 *
 * @param element an AST element
 * @param ignore flag to ignore checking of key or value
 */
export const checkCollectionValue = (
  context: BindContext,
  element: BindingTypes.StructureElement,
  errors: {
    parse: BindingTypes.ParseError[];
    lexer: BindingTypes.LexerError[];
  },
  bindingElements: BindingInfoElement[],
  /* istanbul ignore next */
  aggregation = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const value = element.value;
  if (!isCollectionValue(value)) {
    return [];
  }
  issues.push(...checkBrackets(value));
  // filter undefined
  const elements = value.elements.filter((item) => !!item);

  const text = element.key && element.key.text;
  const bindingElement = bindingElements.find((el) => el.name === text);

  if (!bindingElement) {
    // should have been detected by checkKey
    return issues;
  }
  // check if that element is allowed to have collection value
  const collectionItem = bindingElement.type.find((item) => item.collection);
  if (!collectionItem) {
    const data = typesToValue({
      types: bindingElement.type,
      context,
      forDiagnostic: true,
    });
    /* istanbul ignore next */
    const message = `Allowed value${
      data.length > 1 ? "s are" : " is"
    } ${data.join(" or ")}`;
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "MissMatchValue",
      message,
      range: findRange([value.range, element.range]),
      severity: "error",
    });
    return issues;
  }

  // check empty collection. `parts` must have value where `filters` and `sorter` can have empty collection
  if (elements.length === 0) {
    if (isParts(element)) {
      const data = typesToValue({
        context,
        types: bindingElement.type,
        collectionValue: true,
        forDiagnostic: true,
      });
      const message = `Required value${data.length > 1 ? "s" : ""} ${data.join(
        " or "
      )} must be provided`;
      issues.push({
        issueType: BINDING_ISSUE_TYPE,
        kind: "MissingValue",
        message,
        range: findRange([value.range, element.range]),
        severity: "error",
      });
    }
    return issues;
  }

  // only for parts which can be any of `PropertyBindingInfo` (bindingElements should be PropertyBindingInfo)
  let data = isParts(element)
    ? bindingElements
    : /* istanbul ignore next */
      collectionItem.possibleElements ?? [];
  if (collectionItem.reference) {
    const [bdElement] = getBindingElements(context, aggregation).filter(
      (i) => i.name === collectionItem.reference
    );
    if (!bdElement) {
      // currently checking reference to other binding element only
      /* istanbul ignore next */
      return [];
    }
    const possibleType = bdElement.type.find(
      (i) => /* istanbul ignore next */ i.possibleElements?.length
    );
    /* istanbul ignore next */
    data = possibleType?.possibleElements ?? [];
  }

  for (let index = 0; elements.length > index; index++) {
    const item = elements[index];
    const nextItem = elements[index + 1];
    if (isStructureValue(item)) {
      // parts must have a property binding element
      if (item.elements.length === 0 && isParts(element)) {
        issues.push({
          issueType: BINDING_ISSUE_TYPE,
          kind: "MissingValue",
          message: 'A valid binding property info must be provided for "{}"',
          range: findRange([item.range, value.range, element.range]),
          severity: "error",
        });
      } else {
        issues.push(
          ...checkAst(
            context,
            item,
            errors,
            aggregation,
            data,
            data.length === 0
          )
        );
      }
    }
    if (isCollectionValue(item) && isParts(element)) {
      const nestedColItem = item as BindingTypes.CollectionValue;
      issues.push({
        issueType: BINDING_ISSUE_TYPE,
        kind: "MissingValue",
        message: 'Nested "[]" are not allowed',
        range: findRange([nestedColItem.range, value.range, element.range]),
        severity: "error",
      });
      return issues;
    }
    if (isPrimitiveValue(item)) {
      issues.push(
        ...getPrimitiveValueIssues(context, item, bindingElement, true)
      );
    }
    issues.push(...checkComma(item, errors, value.commas, nextItem));
  }
  return issues;
};
