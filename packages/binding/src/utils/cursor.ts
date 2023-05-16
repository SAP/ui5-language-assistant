import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { CursorContext } from "../types";
import { TextDocumentPositionParams } from "vscode-languageserver-protocol";
import {
  isAfterAdjacentRange,
  isBeforeAdjacentRange,
  positionContained,
} from ".";

export const getCursorContext = (
  parm: TextDocumentPositionParams,
  binding: BindingTypes.Binding,
  spaces: BindingTypes.WhiteSpaces[],
  text = "",
  collection = false
): CursorContext => {
  const { elements, commas } = binding;
  text = text?.trim();
  if (!text && !collection) {
    return {
      type: "initial",
      kind: "expression-binding",
    };
  }
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
    if (positionContained(el.key?.range, position)) {
      return {
        type: "key",
        kind: "properties-excluding-duplicate",
        element: el,
      };
    }
    // check colon
    if (positionContained(el.colon?.range, position)) {
      return {
        type: "colon",
        kind: "colon",
        element: el,
        // option: {}
      };
    }
    // check value
    if (positionContained(el.value?.range, position)) {
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
      // after adjacent key => colon
      if (isAfterAdjacentRange(spaceEl.range, el.key?.range)) {
        // this happen when colon is missing
        return {
          type: "colon",
          kind: "colon",
          element: el,
        };
      }
      // before adjacent key => new key value
      if (isBeforeAdjacentRange(spaceEl.range, el.key?.range)) {
        return {
          type: "key-value",
          kind: "properties-with-value-excluding-duplicate",
          element: el,
        };
      }
      // after adjacent colon => value
      if (isAfterAdjacentRange(spaceEl.range, el.colon?.range)) {
        return {
          type: "value",
          kind: "value",
          element: el,
        };
      }
      // after adjacent value => new key value
      if (isAfterAdjacentRange(spaceEl.range, el.value?.range)) {
        return {
          type: "key-value",
          kind: "properties-with-value-excluding-duplicate",
          element: el,
        };
      }
    }
  }
  // check comma
  let comma = commas.find((item) =>
    isAfterAdjacentRange(spaceEl?.range, item.range)
  );
  if (!comma) {
    comma = commas.find((item) => positionContained(item.range, position));
  }
  if (comma) {
    return {
      type: "key-value",
      kind: "properties-with-value-excluding-duplicate",
      element: comma,
    };
  }
  return {
    type: "unknown",
    kind: "unknown",
  };
};
