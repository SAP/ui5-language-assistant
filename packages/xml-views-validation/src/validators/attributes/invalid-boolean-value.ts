import { XMLAttribute } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getPropertyByAttributeKey } from "@ui5-language-assistant/logic-utils";
import { find, map } from "lodash";
import { InvalidBooleanValueIssue } from "../../../api";

export function validateBooleanValue(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): InvalidBooleanValueIssue[] {
  const actualAttributeValue = attribute.value;
  const actualAttributeValueToken = attribute.syntax.value;
  if (
    actualAttributeValue === null ||
    actualAttributeValueToken === undefined
  ) {
    return [];
  }

  const ui5Property = getPropertyByAttributeKey(attribute, model);
  const propType = ui5Property?.type;
  if (propType?.kind !== "PrimitiveType" || propType.name !== "Boolean") {
    return [];
  }

  const possibleBooleanValues = ["true", "false"];
  if (
    find(possibleBooleanValues, (_) => _ === actualAttributeValue) === undefined
  ) {
    const possibleValuesWithQuotes = map(
      possibleBooleanValues,
      (_) => `"${_}"`
    );
    return [
      {
        kind: "InvalidBooleanValue",
        message: `Invalid value: ${
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
