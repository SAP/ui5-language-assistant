import {
  UI5Type,
  UI5TypedefProp,
} from "@ui5-language-assistant/semantic-model-types";
import { BindContext } from "../types";
import { MarkupKind } from "vscode-languageserver-types";
import { ui5NodeToFQN, getLink } from "@ui5-language-assistant/logic-utils";
import { PROPERTY_BINDING_INFO, AGGREGATION_BINDING_INFO } from "../constant";

const getType = (type: UI5Type | undefined): string[] => {
  const result: string[] = [];
  if (!type) {
    return result;
  }
  const collectionType: string[] = [];
  const noneCollectionType: string[] = [];
  let collectionResult = "";
  let noneColResult = "";
  const data: string[] = [];
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
      type.types.forEach((i) => {
        if (i.kind === "ArrayType") {
          collectionType.push(...getType(i.type));
        } else {
          noneCollectionType.push(...getType(i));
        }
      });
      collectionResult =
        collectionType.length > 0
          ? `Array<(${collectionType.join(" | ")})>`
          : "";
      noneColResult = noneCollectionType.join(" | ");
      if (collectionResult) {
        data.push(collectionResult);
      }
      if (noneColResult) {
        data.push(noneColResult);
      }

      result.push(data.join(" | "));
      break;
    case "ArrayType":
      if (type.type?.kind === "UI5Typedef") {
        result.push(...getType(type.type));
      }
      break;
  }
  return result;
};

export const getDocumentation = (
  context: BindContext,
  prop: UI5TypedefProp,
  aggregation = false,
  forHover = false
): {
  kind: MarkupKind;
  value: string;
} => {
  const binding = aggregation
    ? AGGREGATION_BINDING_INFO
    : PROPERTY_BINDING_INFO;
  const link = getLink(context.ui5Model, binding);
  const values: string[] = [
    `\`(typedef) ${binding}\``,
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
