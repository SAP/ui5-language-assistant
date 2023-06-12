import { XMLAttribute } from "@xml-tools/ast";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { InvalidBooleanValueIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";
import { Context } from "@ui5-language-assistant/context";

export function validateBooleanValue(
  attribute: XMLAttribute,
  context: Context
): InvalidBooleanValueIssue[] {
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
  if (propType?.kind !== "PrimitiveType" || propType.name !== "Boolean") {
    return [];
  }

  if (actualAttributeValue !== "true" && actualAttributeValue !== "false") {
    return [
      {
        issueType: "base",
        kind: "InvalidBooleanValue",
        message: `Invalid boolean value: ${actualAttributeValueToken.image}, expecting "true" or "false".`,
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
