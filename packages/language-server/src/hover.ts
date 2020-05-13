import {
  TextDocumentPositionParams,
  TextDocument,
  CompletionItem,
  Hover,
  Range,
} from "vscode-languageserver";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import {
  buildAst,
  XMLAttribute,
  XMLElement,
  XMLAstVisitor,
  accept,
  XMLDocument,
  XMLToken,
} from "@xml-tools/ast";
import { find } from "lodash";
import { assertNever } from "assert-never";
import {
  flattenEvents,
  flattenProperties,
  flattenAssociations,
  xmlToFQN,
  ui5NodeToFQN,
  flattenAggregations,
} from "@ui5-language-assistant/logic-utils";
import {
  UI5Event,
  UI5Prop,
  UI5Association,
  UI5Class,
  UI5Aggregation,
  UI5SemanticModel,
  BaseUI5Node,
} from "@ui5-language-assistant/semantic-model-types";
import { getNodeDocumentation } from "./documentation";

interface XMLElementHover {
  kind: "XMLElementHover";
  astNode: XMLElement;
}
interface XMLKeyAttributeHover {
  kind: "XMLKeyAttributeHover";
  astNode: XMLAttribute;
}
interface XMLValueAttributeHover {
  kind: "XMLValueAttributeHover";
  astNode: XMLAttribute;
}
export type XMLHoverContext =
  | XMLElementHover
  | XMLKeyAttributeHover
  | XMLValueAttributeHover;

class HoverContextVisitor implements XMLAstVisitor {
  public hoverContext: XMLHoverContext | undefined;
  constructor(public chosenOffset: number | undefined) {}
  visitXMLElement(node: XMLElement): void {
    const openName = node.syntax.openName;
    const closeName = node.syntax.closeName;
    if (this.isInsideRange(openName)) {
      this.hoverContext = { astNode: node, kind: "XMLElementHover" };
    }

    if (this.isInsideRange(closeName)) {
      this.hoverContext = { astNode: node, kind: "XMLElementHover" };
    }
  }

  visitXMLAttribute?(node: XMLAttribute): void {
    const key = node.syntax.key;
    const value = node.syntax.value;

    if (this.isInsideRange(key)) {
      this.hoverContext = { astNode: node, kind: "XMLKeyAttributeHover" };
    }

    if (this.isInsideRange(value)) {
      this.hoverContext = { astNode: node, kind: "XMLValueAttributeHover" };
    }
  }

  isInsideRange(name: XMLToken | undefined): boolean {
    if (
      name !== undefined &&
      this.chosenOffset !== undefined &&
      name.startOffset <= this.chosenOffset &&
      name.endOffset >= this.chosenOffset
    ) {
      return true;
    }

    return false;
  }
}

export function getHoverContext(
  model: UI5SemanticModel,
  textDocumentPosition: TextDocumentPositionParams,
  document: TextDocument
): Hover | undefined {
  const documentText = document.getText();
  const { cst, tokenVector } = parse(documentText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const offset = document.offsetAt(textDocumentPosition.position);
  const ui5Node = getUI5Node(ast, offset, model);
  if (ui5Node != undefined) {
    return transformToLspHover(ui5Node, model);
  }

  return undefined;
}

function getUI5Node(ast: XMLDocument, offset: number, model: UI5SemanticModel) {
  const visitor = new HoverContextVisitor(offset);
  accept(ast, visitor);
  if (visitor.hoverContext?.kind === undefined) {
    return undefined;
  }
  switch (visitor.hoverContext?.kind) {
    case "XMLElementHover":
      return getUI5NodeByElement(visitor.hoverContext.astNode, model);
    case "XMLKeyAttributeHover":
      return getUI5NodeByKey(visitor.hoverContext.astNode, model);
    case "XMLValueAttributeHover":
      return getUI5NodeByValue(visitor.hoverContext.astNode, model);
    case undefined:
      return undefined;
  }
}

function transformToLspHover(
  ui5Node: BaseUI5Node,
  model: UI5SemanticModel
): Hover | undefined {
  const hoverItem: Hover = {
    contents: getNodeDocumentation(ui5Node, model),
  };
  return hoverItem;
}

function getUI5NodeByElement(astNode: XMLElement, model: UI5SemanticModel) {
  const ui5Class = find(
    model.classes,
    (ui5class) => xmlToFQN(astNode) === ui5NodeToFQN(ui5class)
  );

  if (astNode.parent.type === "XMLDocument" || ui5Class != undefined) {
    return getClassByElement(astNode, model);
  } else {
    const parentElementClass = getClassByElement(astNode.parent, model);
    return findAggragationByName(parentElementClass, astNode.name);
  }
}

function getUI5NodeByKey(astNode: XMLAttribute, model: UI5SemanticModel) {
  const parentElementClass = getClassByElement(astNode.parent, model);
  return findUI5ClassMemberByName(parentElementClass, astNode.key);
}

function getUI5NodeByValue(astNode: XMLAttribute, model: UI5SemanticModel) {
  if (astNode.key != null && isXMLNamespaceKey(astNode.key)) {
    const ui5Namespace = find(
      model.namespaces,
      (namespace) => astNode.value === ui5NodeToFQN(namespace)
    );
    return ui5Namespace;
  } else {
    const tag = astNode.parent;
    const elementClass = getClassByElement(tag, model);
    return getUI5EnumByElement(elementClass, astNode.key, astNode.value);
  }

  return undefined;
}

function findUI5ClassMemberByName(
  ui5Class: UI5Class | undefined,
  targetName: string | null
): UI5Prop | UI5Event | UI5Association | undefined {
  if (ui5Class != undefined) {
    const allProps: (UI5Prop | UI5Event | UI5Association)[] = flattenProperties(
      ui5Class
    );
    const allEvents = flattenEvents(ui5Class);
    const allAssociations = flattenAssociations(ui5Class);
    const allClassMembers = allProps.concat(allEvents).concat(allAssociations);
    const found = find(allClassMembers, (_) => _.name === targetName);
    return found;
  }

  return undefined;
}

function findAggragationByName(
  ui5Class: UI5Class | undefined,
  name: string | null
): UI5Aggregation | undefined {
  if (ui5Class != undefined) {
    const allAggregations: UI5Aggregation[] = flattenAggregations(ui5Class);
    const ui5Aggregation = find(
      allAggregations,
      (aggregation) => aggregation.name === name
    );
    return ui5Aggregation;
  }

  return undefined;
}

function getUI5EnumByElement(
  ui5Class: UI5Class | undefined,
  key: string | null,
  value: string | null
) {
  if (ui5Class != undefined) {
    const properties = flattenProperties(ui5Class);
    const ui5Property = find(properties, ["name", key]);
    const propType = ui5Property?.type;
    if (propType?.kind !== "UI5Enum") {
      return undefined;
    }

    const ui5Enum = find(propType.fields, ["name", value]);
    return ui5Enum;
  }

  return undefined;
}

export function isXMLNamespaceKey(key: string): boolean {
  const namespaceRegex = /^xmlns(:(?<prefix>\w*))?$/;
  return key.match(namespaceRegex) !== null;
}

export function getClassByElement(
  element: XMLElement,
  model: UI5SemanticModel
): UI5Class | undefined {
  const elementTagFqn = xmlToFQN(element);
  return model.classes[elementTagFqn];
}
