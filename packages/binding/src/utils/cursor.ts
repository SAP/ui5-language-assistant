import {
  BindingParserTypes as BindingTypes,
  positionContained,
  isAfterAdjacentRange,
} from "@ui5-language-assistant/binding-parser";
import { CursorContext } from "../types";
import { TextDocumentPositionParams } from "vscode-languageserver-protocol";

export const getCursorContext = (
  parm: TextDocumentPositionParams,
  binding: BindingTypes.StructureValue,
  spaces: BindingTypes.WhiteSpaces[]
): CursorContext => {
  /* istanbul ignore next */
  const { elements } = binding;
  if (elements.length === 0) {
    return {
      type: "empty",
      kind: "properties",
    };
  }
  const { position } = parm;
  // search all element
  const el = elements.find((item) => positionContained(item.range, position));
  if (el) {
    // check key
    if (el.key && positionContained(el.key.range, position)) {
      return {
        type: "key",
        kind: "properties-excluding-duplicate",
        element: el,
      };
    }
    // check colon => value
    if (el.colon && positionContained(el.colon.range, position)) {
      return {
        type: "value",
        kind: "value",
        element: el,
      };
    }
    // check value
    if (el.value && positionContained(el.value.range, position)) {
      return {
        type: "value",
        kind: "value",
        element: el,
      };
    }
  }
  // search white spaces
  const spaceEl = spaces.find((item) =>
    positionContained(item.range, position)
  );
  if (spaceEl) {
    // further check parts of adjacent element
    for (const el of elements) {
      // after adjacent key => value
      if (el.key && isAfterAdjacentRange(spaceEl.range, el.key.range)) {
        // this happen when colon is missing
        return {
          type: "value",
          kind: "value",
          element: el,
        };
      }
      // after adjacent colon => value
      if (el.colon && isAfterAdjacentRange(spaceEl.range, el.colon.range)) {
        return {
          type: "value",
          kind: "value",
          element: el,
        };
      }
    }
  }
  return {
    type: "key-value",
    kind: "properties-with-value-excluding-duplicate",
  };
};
