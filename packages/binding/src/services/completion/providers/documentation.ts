import { PropertyBindingInfoElement } from "../../../types";
import { MarkupKind } from "vscode-languageserver-types";

export const getDocumentation = (
  prop: PropertyBindingInfoElement
): {
  kind: MarkupKind;
  value: string;
} => {
  const value = `**Description:** ${prop.description.text} \n\n **Visibility:** ${prop.description.visibility}`;
  return {
    kind: MarkupKind.Markdown,
    value,
  };
};
