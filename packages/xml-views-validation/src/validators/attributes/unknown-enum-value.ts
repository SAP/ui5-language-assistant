import { XMLAttribute } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  flattenProperties,
  xmlToFQN,
} from "@ui5-language-assistant/logic-utils";
import { find, map } from "lodash";
import { UnknownEnumValueIssue } from "../../../api";

// TODO: Some logic here is very similar to: `enumSuggestions` in xml-view-completions,
//  evaluate extracting the common parts
export function validateUnknownEnumValue(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UnknownEnumValueIssue[] {
  const elementTagFqn = xmlToFQN(attribute.parent);
  const ui5Class = model.classes[elementTagFqn];
  if (ui5Class === undefined) {
    return [];
  }

  const properties = flattenProperties(ui5Class);
  const ui5Property = find(properties, ["name", attribute.key]);
  const propType = ui5Property?.type;
  if (propType?.kind !== "UI5Enum") {
    return [];
  }

  const actualAttributeValue = attribute.value;
  const actualAttributeValueToken = attribute.syntax.value;
  if (
    actualAttributeValue === null ||
    actualAttributeValueToken === undefined
  ) {
    return [];
  }

  const possibleEnumValues = map(propType.fields, (_) => _.name);
  if (
    find(possibleEnumValues, (_) => _ === actualAttributeValue) === undefined
  ) {
    const possibleValuesWithQuotes = map(possibleEnumValues, (_) => `"${_}"`);
    return [
      {
        kind: "UnknownEnumValue",
        message: `Unknown enum value: ${
          actualAttributeValueToken.image
        }, expecting one of: [${possibleValuesWithQuotes.join(", ")}].`,
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "error",
      },
    ];
  }

  return [];
}
