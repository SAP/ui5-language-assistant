import { find } from "lodash";
import { assertNever } from "assert-never";
import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { isXMLNamespaceKey } from "@xml-tools/common";
import {
  XMLElementOpenName,
  XMLElementCloseName,
  XMLAttributeKey,
  XMLAttributeValue,
} from "@xml-tools/ast-position";
import {
  flattenAggregations,
  getUI5ClassByXMLElement,
  getUI5PropertyByXMLAttributeKey,
  splitQNameByNamespace,
  isSameXMLNSFromPrefix,
  getUI5ClassByXMLElementClosingTag,
  getUI5NodeByXMLAttribute,
} from "@ui5-language-assistant/logic-utils";
import {
  UI5Class,
  UI5Aggregation,
  UI5SemanticModel,
  UI5EnumValue,
  UI5Enum,
  BaseUI5Node,
} from "@ui5-language-assistant/semantic-model-types";
import { findSymbol } from "@ui5-language-assistant/semantic-model";
import { Context } from "@ui5-language-assistant/context";

export function findUI5HoverNodeAtOffset(
  astPosition:
    | XMLElementOpenName
    | XMLElementCloseName
    | XMLAttributeKey
    | XMLAttributeValue,
  context: Context
): BaseUI5Node | undefined {
  const model = context.ui5Model;
  switch (astPosition.kind) {
    case "XMLElementOpenName":
      return findUI5NodeByElement(astPosition.astNode, model, true);
    case "XMLElementCloseName":
      return findUI5NodeByElement(astPosition.astNode, model, false);
    case "XMLAttributeKey":
      return getUI5NodeByXMLAttribute(astPosition.astNode, model);
    case "XMLAttributeValue":
      return findUI5NodeByXMLAttributeValue(astPosition.astNode, model);
    /* istanbul ignore next - defensive programming */
    default:
      assertNever(astPosition);
  }
}

function findUI5NodeByElement(
  astNode: XMLElement,
  model: UI5SemanticModel,
  isOpenName: boolean
): UI5Class | UI5Aggregation | undefined {
  const ui5Class = isOpenName
    ? getUI5ClassByXMLElement(astNode, model)
    : getUI5ClassByXMLElementClosingTag(astNode, model);
  if (astNode.parent.type === "XMLDocument" || ui5Class !== undefined) {
    return ui5Class;
  }

  const parentElementClass = getUI5ClassByXMLElement(astNode.parent, model);
  if (parentElementClass === undefined) {
    return undefined;
  }

  // openName or closeName cannot be undefined here because otherwise the ast position visitor wouldn't return their types
  const tagQName = isOpenName
    ? /* istanbul ignore next */
      astNode.syntax.openName?.image
    : /* istanbul ignore next */
      astNode.syntax.closeName?.image;
  /* istanbul ignore if */
  if (tagQName === undefined) {
    return undefined;
  }

  // Aggregations must be in the same namespace as their parent
  // https://ui5.sap.com/#/topic/19eabf5b13214f27b929b9473df3195b
  const { prefix, localName } = splitQNameByNamespace(tagQName);
  if (
    !isSameXMLNSFromPrefix(prefix, astNode, astNode.parent.ns, astNode.parent)
  ) {
    return undefined;
  }

  return findAggragationByName(parentElementClass, localName);
}

function findAggragationByName(
  ui5Class: UI5Class,
  targetName: string
): UI5Aggregation | undefined {
  const allAggregations: UI5Aggregation[] = flattenAggregations(ui5Class);
  const ui5Aggregation = find(
    allAggregations,
    (aggregation) => aggregation.name === targetName
  );

  return ui5Aggregation;
}

function findUI5NodeByXMLAttributeValue(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): BaseUI5Node | undefined {
  if (
    attribute.key !== null &&
    attribute.value !== null &&
    isXMLNamespaceKey({ key: attribute.key, includeEmptyPrefix: true })
  ) {
    const ui5Node = findSymbol(model, attribute.value);
    return ui5Node;
  }

  return getUI5EnumByElement(attribute, model);
}

function getUI5EnumByElement(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UI5EnumValue | undefined {
  const enumProp = getEnumProperty(attribute, model);
  if (enumProp !== undefined) {
    const enumValue = find(enumProp.fields, ["name", attribute.value]);
    return enumValue;
  }

  return undefined;
}

function getEnumProperty(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UI5Enum | undefined {
  const ui5Prop = getUI5PropertyByXMLAttributeKey(attribute, model);
  return ui5Prop?.type?.kind === "UI5Enum" ? ui5Prop.type : undefined;
}
