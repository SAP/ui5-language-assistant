import { BindContext, BindingIssue, BINDING_ISSUE_TYPE } from "../../../types";
import {
  isStructureValue,
  BindingParserTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { checkAst } from "./issue-collector";
import { getBindingElements } from "../../../definition/definition";
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
  aggregation = false,
  ignore = false
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const value = element.value;
  if (isStructureValue(value)) {
    if (!ignore) {
      const text = element.key && element.key.text;
      const bindingElement = getBindingElements(context, aggregation).find(
        (el) => el.name === text
      );
      if (!bindingElement) {
        // should have been detected by checkKey
        return issues;
      }
      const elementSpecificType = bindingElement.type.find(
        (i) => i.kind === valueTypeMap.get(value.type)
      );
      // check if that element is allowed to have structure value
      if (!elementSpecificType || elementSpecificType.collection) {
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
    }

    // check its content - recursive call
    issues.push(...checkAst(context, value, errors, aggregation, true));
  }
  return issues;
};
