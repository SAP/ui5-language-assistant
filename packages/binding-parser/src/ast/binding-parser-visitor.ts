import { CstNode, IToken } from "chevrotain";
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
  RIGHT_SQUARE,
  RIGHT_CURLY,
  STRING_VALUE,
  VALUE,
  TEMPLATE,
} from "../constant";
import { createToken } from "../utils/create";
import { locationToRange } from "../utils/range";
import type {
  StructureElement,
  CollectionValue,
  PrimitiveValue,
  StructureValue,
  Value,
  VisitorParam,
  CreateToken,
  ObjectChildren,
  Template,
  BindingNode,
  TemplateChildren,
  TokenType,
  ObjectItemChildren,
  ValueChildren,
  ArrayChildren,
} from "../types/binding-parser";
import { bindingParser } from "../parser/binding-parser";

const BaseVisitor = bindingParser.getBaseCstVisitorConstructor();
class BindingParserVisitor extends BaseVisitor {
  startPosition?: Position;
  constructor(startPosition?: Position) {
    super();
    this.startPosition = startPosition;
    this.validateVisitor();
  }
  visit(cstNode: CstNode): BindingNode {
    return super.visit(cstNode, { location: cstNode.location } as VisitorParam);
  }
  [TEMPLATE](node: TemplateChildren): Template {
    const objects = node[OBJECT] ?? [];
    const spaces = [];
    const ast: Template = {
      bindings: [],
      spaces,
      type: "template",
    };
    for (const data of objects) {
      const result = this.visit(data) as StructureValue;
      ast.bindings.push(result);
    }
    return ast;
  }
  [OBJECT](node: ObjectChildren, param: VisitorParam): StructureValue {
    const leftCurly = this.createToken(LEFT_CURLY, param, node[LEFT_CURLY]);
    const rightCurly = this.createToken(RIGHT_CURLY, param, node[RIGHT_CURLY]);
    const elements: StructureElement[] = [];
    const data = node[OBJECT_ITEM] ?? [];
    for (const element of data) {
      const result = this.visit(element) as StructureElement;
      if (result.key || result.colon || result.value) {
        elements.push(result);
      }
    }
    const range = locationToRange({ ...param, position: this.startPosition });
    const commas = this.getCommas(param, node[COMMA]);
    return {
      leftCurly,
      elements,
      rightCurly,
      range,
      commas,
      type: "structure-value",
    };
  }
  [OBJECT_ITEM](
    node: ObjectItemChildren,
    param: VisitorParam
  ): StructureElement {
    const key = this.createToken(KEY, param, node[KEY] ?? node[STRING_VALUE]);
    const colon = this.createToken(COLON, param, node[COLON]);
    const value = this.isDefined(node[VALUE])
      ? (this.visit(node[VALUE][0]) as Value)
      : undefined;
    const range = locationToRange({ ...param, position: this.startPosition });
    return { key, colon, value, range, type: "structure-element" };
  }
  [VALUE](node: ValueChildren, param: VisitorParam): Value | undefined {
    const primitiveVal = this.primitiveValue(node, param);
    if (primitiveVal) {
      return primitiveVal;
    }

    const structure = node[OBJECT];
    if (structure) {
      /* istanbul ignore next */
      if (!structure.length) {
        return;
      }
      return this.visit(structure[0]) as Value;
    }
    const data = node[ARRAY];
    if (data) {
      if (!data.length) {
        /* istanbul ignore next */
        return;
      }
      return this.visit(data[0]) as Value;
    }
    return;
  }
  primitiveValue(node: ValueChildren, param: VisitorParam): Value | undefined {
    let data = node[STRING_VALUE];
    if (data) {
      return this.createToken(STRING_VALUE, param, data);
    }
    data = node[NUMBER_VALUE];
    if (data) {
      return this.createToken(NUMBER_VALUE, param, data);
    }
    data = node[NULL_VALUE];
    if (data) {
      return this.createToken(NULL_VALUE, param, data);
    }
    data = node[BOOLEAN_VALUE];
    return this.createToken(BOOLEAN_VALUE, param, data);
  }
  [ARRAY](node: ArrayChildren, param: VisitorParam): CollectionValue {
    const leftSquare = this.createToken(LEFT_SQUARE, param, node[LEFT_SQUARE]);
    const rightSquare = this.createToken(
      RIGHT_SQUARE,
      param,
      node[RIGHT_SQUARE]
    );
    const commas = this.getCommas(param, node[COMMA]);
    const elements: (PrimitiveValue | StructureValue)[] = [];
    const data = node[VALUE] ?? [];
    for (const element of data) {
      const result = this.visit(element) as PrimitiveValue | StructureValue;
      elements.push(result);
    }
    const range = locationToRange({ ...param, position: this.startPosition });
    return {
      leftSquare,
      elements,
      rightSquare,
      range,
      commas,
      type: "collection-value",
    };
  }
  createToken<T extends TokenType>(
    type: T,
    param: VisitorParam,
    node: IToken[] | undefined
  ): CreateToken<T> | undefined {
    if (!this.isDefined(node)) {
      return;
    }
    return createToken(node[0], type, {
      ...param,
      position: this.startPosition,
    });
  }
  getCommas(
    param: VisitorParam,
    nodes: IToken[] = []
  ): CreateToken<typeof COMMA>[] {
    const commas: CreateToken<typeof COMMA>[] = [];
    for (const comma of nodes) {
      const commaToken = this.createToken(COMMA, param, [comma]);
      if (commaToken) {
        commas.push(commaToken);
      }
    }
    return commas;
  }
  isDefined<T>(node: T[] | undefined): node is T[] {
    if (!node || node.length === 0) {
      return false;
    }
    return true;
  }
}

export const bindingParserVisitor = (
  startPosition?: Position
): BindingParserVisitor => new BindingParserVisitor(startPosition);
