import { BindContext, BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import {
  isStructureValue,
  LEFT_CURLY,
  BindingParserTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { checkAst } from "./issue-collector";
import { propertyBindingInfoElements } from "../../../definition/definition";
import { findRange, typesToValue, valueTypeMap } from "../../../utils";

/**
 * Check structure value
 *
 * @param element AST element
 * @param ignore a flag to ignore if an element is allowed to have structure value
 */
export const checkStructureValue = (
  context: BindContext,
  element: BindingTypes.StructureElement,
  errors: {
    parse: BindingTypes.ParseError[];
    lexer: BindingTypes.LexerError[];
  },
  ignore = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const value = element.value;
  if (isStructureValue(value)) {
    if (!ignore) {
      const bindingElement = propertyBindingInfoElements.find(
        (el) => el.name === (element.key && element.key.text)
      );
      if (!bindingElement) {
        // should have been detected by checkKey
        return issues;
      }
      const elementSpecificType = bindingElement.type.find(
        (i) => i.kind === valueTypeMap.get(LEFT_CURLY)
      );
      // check if that element is allowed to have structure value
      if (!elementSpecificType || elementSpecificType.collection) {
        const data = typesToValue(bindingElement.type, context);
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
    }

    // check its content - recursive call
    issues.push(...checkAst(context, value, errors, true));
  }
  return issues;
};
