import { XMLAttribute } from "@xml-tools/ast";
import {
  getUI5PropertyByXMLAttributeKey,
  getUI5AggregationByXMLAttributeKey,
} from "@ui5-language-assistant/logic-utils";
import { getLogger } from "../../utils";
import { Hover } from "vscode-languageserver";
import {
  parseBinding,
  isBindingAllowed,
  isBindingExpression,
  extractBindingSyntax,
  rangeContained,
  BindingParserTypes,
} from "@ui5-language-assistant/binding-parser";
import { Position } from "vscode-languageserver-types";
import { BindContext, BindingInfoElement } from "../../types";
import { getBindingElements } from "../../definition/definition";

const getHoverFromBinding = (
  context: BindContext,
  propertyBinding: BindingInfoElement[],
  binding: BindingParserTypes.StructureValue
): Hover | undefined => {
  let hover: Hover | undefined;
  /* istanbul ignore next */
  const cursorPos = context.textDocumentPosition?.position;
  for (const element of binding.elements) {
    if (
      cursorPos &&
      element.range &&
      rangeContained(element.range, {
        start: cursorPos,
        end: cursorPos,
      })
    ) {
      // check if cursor is on key range
      if (
        cursorPos &&
        element.key &&
        rangeContained(element.key.range, {
          start: cursorPos,
          end: cursorPos,
        })
      ) {
        // check valid key
        const property = propertyBinding.find(
          (prop) => prop.name === element.key?.originalText
        );
        if (property) {
          return { contents: property.documentation };
        }
      }

      // check collection value as they may have property binding
      if (element.value?.type === "collection-value") {
        for (const collectionEl of element.value.elements) {
          if (collectionEl.type !== "structure-value") {
            continue;
          }
          hover = getHoverFromBinding(context, propertyBinding, collectionEl);
          if (hover) {
            return hover;
          }
        }
      }
    }
  }
  return hover;
};

export const getHover = (
  context: BindContext,
  attribute: XMLAttribute
): Hover | undefined => {
  try {
    const ui5Property = getUI5PropertyByXMLAttributeKey(
      attribute,
      context.ui5Model
    );
    const ui5Aggregation = getUI5AggregationByXMLAttributeKey(
      attribute,
      context.ui5Model
    );
    if (!ui5Property && !ui5Aggregation) {
      return;
    }
    const value = attribute.syntax.value;
    /* istanbul ignore next */
    const text = attribute.value ?? "";
    if (text.trim().length === 0) {
      return;
    }
    const propBinding = getBindingElements(context, !!ui5Aggregation, true);
    const properties = propBinding.map((i) => i.name);
    const extractedText = extractBindingSyntax(text);
    for (const bindingSyntax of extractedText) {
      const { expression, startIndex } = bindingSyntax;
      if (isBindingExpression(expression)) {
        continue;
      }
      /* istanbul ignore next */
      const position: Position = {
        character: (value?.startColumn ?? 0) + startIndex,
        line: value?.startLine ? value.startLine - 1 : 0, // zero based index
      };
      const { ast, errors } = parseBinding(expression, position);
      /* istanbul ignore next */
      const cursorPos = context.textDocumentPosition?.position;
      const binding = ast.bindings.find(
        (b) =>
          cursorPos &&
          b.range &&
          rangeContained(b.range, { start: cursorPos, end: cursorPos })
      );
      if (!binding) {
        continue;
      }
      if (!isBindingAllowed(text, binding, errors, properties)) {
        continue;
      }
      return getHoverFromBinding(context, propBinding, binding);
    }
    return;
  } catch (error) {
    getLogger().debug("getHover failed:", error);
    return;
  }
};
