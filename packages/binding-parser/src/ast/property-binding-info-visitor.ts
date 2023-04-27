import { CstNode, CstChildrenDictionary, IToken } from "chevrotain";
import type { Position } from "vscode-languageserver-types";
import {
  ARRAY,
  BOOLEAN_VALUE,
  COLON,
  COMMA,
  KEY,
  LEFT_SQUARE,
  LEFT_CURLY,
  NULL_VALUE,
  NUMBER_VALUE,
  OBJECT,
  OBJECT_ITEM,
  PROPERTY_BINDING_INFO,
  RIGHT_SQUARE,
  RIGHT_CURLY,
  STRING_VALUE,
  VALUE,
} from "../constant";
import { createNode } from "../utils/create";
import { locationToRange } from "../utils/range";
import type {
  Ast,
  AstElement,
  CollectionValue,
  Comma,
  PrimitiveValue,
  StructureValue,
  Value,
  VisitorParam,
} from "../types/property-binding-info";
import { propertyBindingInfoParser } from "../parser/property-binding-info";

const BaseVisitor = propertyBindingInfoParser.getBaseCstVisitorConstructor();
class PropertyBindingInfoVisitor extends BaseVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }
  [PROPERTY_BINDING_INFO](
    node: CstChildrenDictionary,
    position?: Position
  ): Ast {
    const data = node[OBJECT] as CstNode[];
    const param: VisitorParam = {
      position,
      location: data?.[0].location,
    };
    const result = this.visit(data, param) as Ast;
    return result;
  }
  [OBJECT](node: CstChildrenDictionary, param: VisitorParam): Ast {
    const leftCurly = this[LEFT_CURLY](
      (node[LEFT_CURLY] as IToken[]) ?? [],
      param
    );
    const rightCurly = this[RIGHT_CURLY](
      (node[RIGHT_CURLY] as IToken[]) ?? [],
      param
    );
    const elements: AstElement[] = [];
    const data = (node[OBJECT_ITEM] as CstNode[]) ?? [];
    const comma = (node[COMMA] as IToken[]) ?? [];
    const commas: Comma[] = [];
    for (const el of comma) {
      commas.push(createNode(el, COMMA, param));
    }
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const newParam = {
        ...param,
        location: element.location,
      };
      const result = this.visit(element, newParam);
      if (result.key || result.colon || result.value) {
        elements.push(result);
      }
    }
    const range = locationToRange(param.location, param.position);
    const errors = {
      lexer: [],
      parse: [],
    };
    const spaces = [];
    return {
      leftCurly,
      elements,
      commas,
      rightCurly,
      range,
      errors,
      spaces,
    };
  }
  [OBJECT_ITEM](node: CstChildrenDictionary, param: VisitorParam): AstElement {
    const key = this[KEY](node[KEY] as IToken[], param);
    const colon = this[COLON](node[COLON] as IToken[], param);
    const value = this.visit(node[VALUE] as CstNode[], param);
    const range = locationToRange(param.location, param.position);
    return { key, colon, value, range };
  }
  [VALUE](node: CstChildrenDictionary, param: VisitorParam): Value | undefined {
    let data = node[STRING_VALUE];
    if (data) {
      if (!data.length) {
        return;
      }
      return createNode(data[0] as IToken, STRING_VALUE, param);
    }
    data = node[NUMBER_VALUE];
    if (data) {
      if (!data.length) {
        return;
      }
      return createNode(data[0] as IToken, NUMBER_VALUE, param);
    }
    data = node[NULL_VALUE];
    if (data) {
      if (!data.length) {
        return;
      }
      return createNode(data[0] as IToken, NULL_VALUE, param);
    }
    data = node[BOOLEAN_VALUE];
    if (data) {
      if (!data.length) {
        return;
      }
      return createNode(data[0] as IToken, BOOLEAN_VALUE, param);
    }
    data = node[OBJECT];
    if (data) {
      if (!data.length) {
        return;
      }
      const structureData = data as CstNode[];
      return this.visit(structureData, {
        ...param,
        location: structureData[0].location,
      });
    }
    data = node[ARRAY];
    if (data) {
      if (!data.length) {
        return;
      }
      return this.visit(data as CstNode[], param);
    }
    return;
  }
  [ARRAY](node: CstChildrenDictionary, param: VisitorParam): CollectionValue {
    const leftSquare = this[LEFT_SQUARE](
      (node[LEFT_SQUARE] as IToken[]) ?? [],
      param
    );
    const rightSquare = this[RIGHT_SQUARE](
      (node[RIGHT_SQUARE] as IToken[]) ?? [],
      param
    );
    const elements: (PrimitiveValue | StructureValue)[] = [];
    const comma = (node[COMMA] as IToken[]) ?? [];
    const commas: Comma[] = [];
    for (const el of comma) {
      commas.push(createNode(el, COMMA, param));
    }
    const data = (node[VALUE] as CstNode[]) ?? [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const newParam = {
        ...param,
        location: element.location,
      };
      const result = this.visit(element, newParam) as
        | PrimitiveValue
        | StructureValue;
      elements.push(result);
    }
    const errors = {
      lexer: [],
      parse: [],
    };
    const spaces = [];
    const range = locationToRange(param.location, param.position);
    return {
      leftSquare,
      elements,
      rightSquare,
      range,
      errors,
      spaces,
      commas,
    };
  }
  [LEFT_CURLY](node: IToken[], param: VisitorParam) {
    if (node.length === 0) {
      return;
    }
    return createNode(node[0], LEFT_CURLY, param);
  }
  [RIGHT_CURLY](node: IToken[] | undefined, param: VisitorParam) {
    if (!node) {
      return;
    }
    if (node.length === 0) {
      return;
    }
    return createNode(node[0], RIGHT_CURLY, param);
  }
  [LEFT_SQUARE](node: IToken[], param: VisitorParam) {
    if (node.length === 0) {
      return;
    }
    return createNode(node[0], LEFT_SQUARE, param);
  }
  [RIGHT_SQUARE](node: IToken[], param: VisitorParam) {
    if (node.length === 0) {
      return;
    }
    return createNode(node[0], RIGHT_SQUARE, param);
  }
  [KEY](node: IToken[] | undefined, param: VisitorParam) {
    if (!node) {
      return;
    }
    if (node.length === 0) {
      return;
    }
    return createNode(node[0], KEY, param);
  }
  [COLON](node: IToken[] | undefined, param: VisitorParam) {
    if (!node) {
      return;
    }
    if (node.length === 0) {
      return;
    }
    return createNode(node[0], COLON, param);
  }
  [COMMA](node: IToken[], param: VisitorParam) {
    if (node.length === 0) {
      return;
    }
    return createNode(node[0], COMMA, param);
  }
}

export const propertyBindingInfoVisitor = new PropertyBindingInfoVisitor();
