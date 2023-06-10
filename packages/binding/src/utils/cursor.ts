import {
  PropertyBindingInfoTypes as BindingTypes,
  positionContained,
  isAfterAdjacentRange,
  isBeforeAdjacentRange,
} from "@ui5-language-assistant/binding-parser";
import { CursorContext } from "../types";
import { TextDocumentPositionParams } from "vscode-languageserver-protocol";

export const getCursorContext = (
  parm: TextDocumentPositionParams,
  binding: BindingTypes.StructureValue,
  spaces: BindingTypes.WhiteSpaces[]
): CursorContext => {
  /* istanbul ignore next */
  const { elements, commas = [] } = binding;
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
    if (positionContained(el.key && el.key.range, position)) {
      return {
        type: "key",
        kind: "properties-excluding-duplicate",
        element: el,
      };
    }
    // check value
    if (positionContained(el.value && el.value.range, position)) {
      return {
        type: "value",
        kind: "value",
        element: el,
      };
    }
  }
  // check comma
  const comma = commas.find((co) => positionContained(co.range, position));
  if (comma) {
    const el = elements.find((item) =>
      positionContained(item.range, comma.range.start)
    );
    if (el) {
      return {
        type: "key-value",
        kind: "properties-with-value-excluding-duplicate",
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
      if (isAfterAdjacentRange(spaceEl.range, el.key && el.key.range)) {
        // this happen when colon is missing
        return {
          type: "colon",
          kind: "colon",
          element: el,
        };
      }
      // before adjacent key => new key value
      if (isBeforeAdjacentRange(spaceEl.range, el.key && el.key.range)) {
        return {
          type: "key-value",
          kind: "properties-with-value-excluding-duplicate",
          element: el,
        };
      }
      // after adjacent colon => value
      if (isAfterAdjacentRange(spaceEl.range, el.colon && el.colon.range)) {
        return {
          type: "value",
          kind: "value",
          element: el,
        };
      }
      // after adjacent value => new key value
      if (isAfterAdjacentRange(spaceEl.range, el.value && el.value.range)) {
        return {
          type: "key-value",
          kind: "properties-with-value-excluding-duplicate",
          element: el,
        };
      }
      // after adjacent comma => new key value
      const comma = commas.find((co) =>
        isAfterAdjacentRange(spaceEl.range, co.range)
      );
      if (comma) {
        return {
          type: "key-value",
          kind: "properties-with-value-excluding-duplicate",
          element: el,
        };
      }
    }
  }
  return {
    type: "unknown",
    kind: "unknown",
  };
};
