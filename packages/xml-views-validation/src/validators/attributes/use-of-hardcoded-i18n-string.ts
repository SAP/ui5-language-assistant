import { XMLAttribute } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { UseOfHardcodedI18nStringIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";
import { getUserFacingAttributes } from "../../utils/ui5-user-facing-attributes";
import { find } from "lodash";

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
  const propLibrary = ui5Property?.library;
  const propParentClass = ui5Property?.parent?.name;
  let propParentClassFullName = "";
  if (propLibrary && propParentClass) {
    propParentClassFullName = propLibrary + "." + propParentClass;
  }

  if (propType?.kind !== "PrimitiveType" || propType.name !== "String") {
    return [];
  }

  //Check whether the current UI5 property holds GUI text. Limitation: getUI5PropertyByXMLAttributeKey only supports property attributes, but not aggregation attributes that accept strings e.g. <sap.ui.layout.form.FormElement label="some text">.
  const oUITextProperties = getUserFacingAttributes();

  if (propParentClassFullName && oUITextProperties[propParentClassFullName]) {
    const sUITextualProperty = find(
      oUITextProperties[propParentClassFullName],
      (sUITextualProperty) => sUITextualProperty === ui5Property?.name
    );

    if (sUITextualProperty) {
      const actualAttributeValueTokenTrim = actualAttributeValueToken.image
        .trim()
        .replace(/[\n\t]/g, "")
        .replace(/\s+(?=\s)/g, "");
      return [
        {
          kind: "UseOfHardcodedI18nString",
          message: `Consider externalizing UI texts to a resource bundle or other model: ${actualAttributeValueTokenTrim}.`,
          severity: "warn",
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
        },
      ];
    }
  }

  return [];
}
