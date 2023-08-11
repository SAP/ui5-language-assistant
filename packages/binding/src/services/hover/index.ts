import { XMLAttribute } from "@xml-tools/ast";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
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
import { BindContext } from "../../types";
import { PROPERTY_BINDING_INFO } from "../../constant";
import { getDocumentation } from "../../utils";
import { UI5Typedef } from "@ui5-language-assistant/semantic-model-types";

const getHoverFromBinding = (
  context: BindContext,
  propertyBinding: UI5Typedef,
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
        const property = propertyBinding.properties.find(
          (prop) => prop.name === element.key?.originalText
        );
        if (property) {
          return { contents: getDocumentation(context, property, true) };
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
    const propBinding = context.ui5Model.typedefs[PROPERTY_BINDING_INFO];
    if (!propBinding) {
      return;
    }
    const ui5Property = getUI5PropertyByXMLAttributeKey(
      attribute,
      context.ui5Model
    );
    if (!ui5Property) {
      return;
    }
    const value = attribute.syntax.value;
    /* istanbul ignore next */
    const text = attribute.value ?? "";
    if (text.trim().length === 0) {
      return;
    }

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
      if (!isBindingAllowed(text, binding, errors)) {
        continue;
      }
      return getHoverFromBinding(context, propBinding, binding);
    }
    return;
  } catch (error) {
    getLogger().debug("validatePropertyBindingInfo failed:", error);
    return;
  }
};
