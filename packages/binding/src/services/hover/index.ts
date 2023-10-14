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
  isStructureValue,
  isCollectionValue,
} from "@ui5-language-assistant/binding-parser";
import { Position } from "vscode-languageserver-types";
import { BindContext, BindingInfoElement } from "../../types";
import { getBindingElements } from "../../definition/definition";

const getHoverFromBinding = (
  context: BindContext,
  bindingElements: BindingInfoElement[],
  binding: BindingParserTypes.StructureValue,
  aggregation: boolean
): Hover | undefined => {
  let hover: Hover | undefined;
  /* istanbul ignore next */
  const cursorPos = context.textDocumentPosition?.position;
  if (!cursorPos) {
    return;
  }
  for (const element of binding.elements) {
    if (
      !(
        element.range &&
        rangeContained(element.range, {
          start: cursorPos,
          end: cursorPos,
        })
      )
    ) {
      continue;
    }

    // check valid key
    const property = bindingElements.find(
      (prop) => prop.name === element.key?.text
    );

    // check if cursor is on key range
    if (
      element.key &&
      rangeContained(element.key.range, {
        start: cursorPos,
        end: cursorPos,
      })
    ) {
      if (property) {
        return { contents: property.documentation };
      }
    }

    const value = element.value;
    if (isStructureValue(value)) {
      let data = bindingElements;
      if (property) {
        const referencedType = property.type.find((t) => t.reference);
        if (referencedType) {
          const [bdElement] = getBindingElements(
            context,
            aggregation,
            true
          ).filter((i) => i.name === referencedType.reference);
          if (!bdElement) {
            return;
          }
          const possibleType = bdElement.type.find(
            (i) => i.possibleElements?.length
          );
          data = possibleType?.possibleElements ?? [];
        } else {
          const typeWithPossibleEl = property?.type.find(
            (t) => t.possibleElements
          );
          if (typeWithPossibleEl?.possibleElements?.length) {
            data = typeWithPossibleEl.possibleElements;
          }
        }
        return getHoverFromBinding(context, data, value, aggregation);
      }
    }

    // check collection value as they may have property binding
    if (isCollectionValue(value)) {
      for (const collectionEl of value.elements) {
        if (collectionEl.type !== "structure-value") {
          continue;
        }
        const typeWithPossibleEl = property?.type.find(
          (t) => t.possibleElements
        );
        hover = getHoverFromBinding(
          context,
          typeWithPossibleEl?.possibleElements ?? bindingElements,
          collectionEl,
          aggregation
        );
        if (hover) {
          return hover;
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
      return getHoverFromBinding(
        context,
        propBinding,
        binding,
        !!ui5Aggregation
      );
    }
    return;
  } catch (error) {
    getLogger().debug("getHover failed:", error);
    return;
  }
};
