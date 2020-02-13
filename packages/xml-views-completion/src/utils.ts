import { DEFAULT_NS, XMLElement } from "@xml-tools/ast";
import {
  BaseUI5Node,
  UI5Aggregation,
  UI5Class,
  UI5SemanticModel
} from "@vscode-ui5/semantic-model";
import { find } from "lodash";

export function xmlToFQN(astElement: XMLElement): string {
  // TODO: is this the optimal way to handle nameless elements?
  const baseName = astElement.name ? astElement.name : "";
  // if no NS is explicitly defined try the default one
  const prefixXmlns = astElement.ns ? astElement.ns : DEFAULT_NS;
  const resolvedXmlns = astElement.namespaces[prefixXmlns];

  if (resolvedXmlns !== undefined) {
    // Note that adding the 'dot' seems to be a UI5 semantic, not xmlns semantics
    // As those are mainly about simple text replacement.
    return resolvedXmlns + "." + baseName;
  } else {
    return baseName;
  }
}

// TODO: move this util to UI5-Semantic Model or Utils package.
export function ui5NodeToFQN(ui5Node: BaseUI5Node): string {
  const nameParts = [];
  let currNode = ui5Node;
  while (currNode !== undefined) {
    nameParts.push(currNode.name);
    currNode = currNode.parent;
  }

  const fqn = nameParts.reverse().join(".");
  return fqn;
}

// TODO: move this util to UI5-Semantic Model or utils package.
export function getSuperClasses(clazz: UI5Class): UI5Class[] {
  const superClasses = [];
  let currClass: UI5Class | undefined = clazz;
  while (currClass) {
    superClasses.push(currClass);
    currClass = currClass.extends;
  }
  return superClasses;
}

// TODO: move this util to UI5-Semantic Model or Utils package.
export function isControlSubClass(clazz: UI5Class): boolean {
  const superClasses = getSuperClasses(clazz);
  const hasControlAsSuperClass =
    find(superClasses, _ => ui5NodeToFQN(_) === "sap.ui.core.Control") !==
    undefined;

  return hasControlAsSuperClass;
}

export function flattenAggregations(
  ui5Class: UI5Class,
  model: UI5SemanticModel
): UI5Aggregation[] {
  const directAggregations = ui5Class.aggregations;
  const ui5SuperClass = ui5Class.extends;
  if (ui5SuperClass !== undefined) {
    // UI5 SDK refers to inherited aggregations as "borrowed" ...
    const borrowedAggregations = flattenAggregations(ui5SuperClass, model);
    return directAggregations.concat(borrowedAggregations);
  } else {
    return directAggregations;
  }
}
