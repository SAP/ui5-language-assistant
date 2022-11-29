import { XMLAttribute } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { UseOfHardcodedI18nStringIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";
import { getUserFacingAttributes } from "../../utils/ui5-user-facing-attributes";
import { find } from "lodash";

const NEW_LINE_PATTERN = /[\n\t]/g;
const DOUBLE_SPACE_PATTERN = /\s+(?=\s)/g;

export function validateI18nExternalization(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UseOfHardcodedI18nStringIssue[] {
  const actualAttributeValue = attribute.value;
  const actualAttributeValueToken = attribute.syntax.value;
  if (
    actualAttributeValue === null ||
    actualAttributeValue === "" ||
    actualAttributeValueToken === undefined ||
    isPossibleBindingAttributeValue(actualAttributeValue)
  ) {
    return [];
  }

  const ui5Property = getUI5PropertyByXMLAttributeKey(attribute, model);
  const propType = ui5Property?.type;
  const propParent = ui5Property?.parent;

  if (!ui5Property || !propType || !propParent) {
    return [];
  }

  if (propType.kind !== "PrimitiveType" || propType.name !== "String") {
    return [];
  }

  const propLibrary = ui5Property.library;
  const propParentClass = propParent.name;
  const propParentClassFullName = propLibrary + "." + propParentClass;

  //Load UI textual properties
  const oUITextProperties = getUserFacingAttributes();

  //Check if the current UI5 element can include UI5 properties that hold GUI text
  if (!oUITextProperties[propParentClassFullName]) {
    return [];
  }

  //Check if the current UI5 property holds GUI text. Limitation: getUI5PropertyByXMLAttributeKey only supports property attributes, but not aggregation attributes that accept strings e.g. <sap.ui.layout.form.FormElement label="some text">.
  const sUITextualProperty = find(
    oUITextProperties[propParentClassFullName],
    (sUITextualProperty) => sUITextualProperty === ui5Property.name
  );

  if (!sUITextualProperty) {
    return [];
  }

  const actualAttributeValueTokenTrim = actualAttributeValueToken.image
    .trim()
    .replace(NEW_LINE_PATTERN, "")
    .replace(DOUBLE_SPACE_PATTERN, "");

  const hardcodedStringIssue: UseOfHardcodedI18nStringIssue = {
    kind: "UseOfHardcodedI18nString",
    message: `Consider externalizing UI texts to a resource bundle or other model: ${actualAttributeValueTokenTrim}.`,
    severity: "warn",
    offsetRange: {
      start: actualAttributeValueToken.startOffset,
      end: actualAttributeValueToken.endOffset,
    },
  };

  return [hardcodedStringIssue];
}
