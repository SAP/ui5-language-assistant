import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { CursorContext } from "../types";
import {
  TextDocumentPositionParams,
  Range,
  Position,
} from "vscode-languageserver-protocol";
import {
  isAfterAdjacentRange,
  isBeforeAdjacentRange,
  positionContained,
  rangeContained,
} from ".";

const isCommaNotAvailable = (
  ast: BindingTypes.Ast,
  position?: Position
): boolean => {
  const { commas, spaces } = ast;
  if (!position) {
    return false;
  }
  if (commas.length === 0) {
    return true;
  }
  // check commas
  let el = commas.find((item) => positionContained(item.range, position));
  if (!el) {
    // check spaces
    const spaceEl = spaces.find((item) =>
      positionContained(item.range, position)
    );
    if (spaceEl) {
      // check commas
      el = commas.find((item) =>
        positionContained(spaceEl.range, item.range.end)
      );
      if (el) {
        return false;
      }
    }
  }
  return true;
};

export const getCursorContext = (
  parm: TextDocumentPositionParams,
  ast: BindingTypes.Ast,
  text = ""
): CursorContext => {
  const {
    errors: { lexer },
    spaces,
    elements,
    commas,
    rightCurly,
  } = ast;
  text = text?.trim();
  if (!text) {
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
        // option: {},
        element: el,
        // option: {
        //   kind: "colon",
        //   generate: el.colon?.text ? false : true,
        //   position: "after",
        // },
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
        // option: {
        //   kind: "value",
        //   generate: false, // todo for complex value - check if option is really needed??
        //   // generate: el.value ? false : true, // todo for complex value - check if option is really needed??
        // },
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
          // option: {},
        };
      }
      // before adjacent key => new key value
      if (isBeforeAdjacentRange(spaceEl.range, el.key?.range)) {
        return {
          type: "key-value",
          kind: "properties-with-value-excluding-duplicate",
          element: el,
          // option: {
          //   kind: "comma",
          //   generate: false,
          //   position: "after",
          // },
        };
      }
      // after adjacent colon => value
      if (isAfterAdjacentRange(spaceEl.range, el.colon?.range)) {
        return {
          type: "value",
          kind: "value",
          // option: {
          //   kind: "value",
          //   generate: false, // todo - check complex
          // },
          element: el,
        };
      }
      // after adjacent value => new key value
      if (isAfterAdjacentRange(spaceEl.range, el.value?.range)) {
        return {
          type: "key-value",
          kind: "properties-with-value-excluding-duplicate",
          element: el,
          // option: {
          //   kind: "comma",
          //   generate: false,
          //   position: "before",
          // },
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
      // option: {
      //   kind: "comma",
      //   generate: false,
      // },
    };
  }
  return {
    type: "unknown",
    kind: "unknown",
  };
};
