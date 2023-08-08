import {
  UI5Type,
  UI5TypedefProp,
} from "@ui5-language-assistant/semantic-model-types";
import { BindContext } from "../types";
import { MarkupKind } from "vscode-languageserver-types";
import { ui5NodeToFQN, getLink } from "@ui5-language-assistant/logic-utils";
import { PROPERTY_BINDING_INFO } from "../constant";

const getType = (type: UI5Type | undefined): string[] => {
  const result: string[] = [];
  if (!type) {
    return result;
  }

  const unionType: string[] = [];
  switch (type.kind) {
    case "PrimitiveType":
      result.push(type.name);
      break;
    case "UI5Typedef":
    case "UI5Class":
    case "UI5Enum":
      result.push(ui5NodeToFQN(type));
      break;
    case "UnionType":
      type.types.forEach((i) => unionType.push(...getType(i)));
      if (type.collection) {
        result.push(`Array<(${unionType.join(" | ")}>)`);
      } else {
        result.push(unionType.join(" | "));
      }
      break;
  }
  return result;
};

export const getDocumentation = (
  context: BindContext,
  prop: UI5TypedefProp,
  forHover = false
): {
  kind: MarkupKind;
  value: string;
} => {
  const link = getLink(context.ui5Model, PROPERTY_BINDING_INFO);
  const values: string[] = [
    `\`(typedef) ${PROPERTY_BINDING_INFO}\``,
    forHover ? `---` : "",
    `**Type:** ${getType(prop.type)}`,
    `**Description:** ${prop.description}`,
    `**Optional:** ${prop.optional}`,
    `[More information](${link})`,
  ];
  return {
    kind: MarkupKind.Markdown,
    value: values.join("\n\n"),
  };
};
