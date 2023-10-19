import {
  UI5Type,
  UI5TypedefProp,
} from "@ui5-language-assistant/semantic-model-types";
import { BindContext } from "../types";
import { MarkupKind } from "vscode-languageserver-types";
import { ui5NodeToFQN, getLink } from "@ui5-language-assistant/logic-utils";
import { PROPERTY_BINDING_INFO } from "../constant";
import { t } from "../i18n";
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
    case "UI5Any": {
      result.push(type.name);
      break;
    }
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

export const getDocumentation = (param: {
  context: BindContext;
  prop: UI5TypedefProp;
  FQN?: string;
  titlePrefix?: string;
  forHover?: boolean;
}): {
  kind: MarkupKind;
  value: string;
} => {
  const {
    forHover = false,
    FQN = PROPERTY_BINDING_INFO,
    titlePrefix = "(typedef)",
    context,
    prop,
  } = param;
  const link = getLink(context.ui5Model, FQN);
  const values: string[] = [
    `\`${titlePrefix} ${FQN}\``,
    forHover ? `---` : "",
    `**${t("TYPE")}** ${getType(prop.type)}`,
    `**${t("DESCRIPTION")}** ${prop.description}`,
    `**${t("OPTIONAL")}** ${prop.optional}`,
    `${t("MORE_INFO")}(${link})`,
  ];
  return {
    kind: MarkupKind.Markdown,
    value: values.join("\n\n"),
  };
};
