import { PropertyBindingInfoElement } from "../../../types";
import { MarkupKind } from "vscode-languageserver-types";

export const getDocumentation = (
  prop: PropertyBindingInfoElement
): {
  kind: MarkupKind;
  value: string;
} => {
  const value = `**Type:** ${prop.documentation.type} \n\n **Description:** ${prop.documentation.description} \n\n **Visibility:** ${prop.documentation.visibility} \n\n **Optional:** ${prop.documentation.optional}`;
  return {
    kind: MarkupKind.Markdown,
    value,
  };
};
