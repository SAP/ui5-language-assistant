import { XMLAttribute } from "@xml-tools/ast";
import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { find, map } from "lodash";
import { UnknownEnumValueIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";

export function validateUnknownEnumValue(
  attribute: XMLAttribute,
  context: AppContext
): UnknownEnumValueIssue[] {
  const actualAttributeValue = attribute.value;
  const actualAttributeValueToken = attribute.syntax.value;
  if (
    actualAttributeValue === null ||
    actualAttributeValueToken === undefined ||
    isPossibleBindingAttributeValue(actualAttributeValue)
  ) {
    return [];
  }

  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );
  const propType = ui5Property?.type;
  if (propType?.kind !== "UI5Enum") {
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
