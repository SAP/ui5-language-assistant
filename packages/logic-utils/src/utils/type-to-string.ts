import { UI5Type } from "@ui5-editor-tools/semantic-model-types";
import { ui5NodeToFQN } from "src/api";

export function typeToString(type: UI5Type | undefined): string {
  if (type === undefined) {
    return "any";
  }
  switch (type.kind) {
    // Types with fully qualified name
    case "UI5Class":
    case "UI5Enum":
    case "UI5Interface":
    case "UI5Namespace":
    case "UI5Typedef":
      return ui5NodeToFQN(type);
    case "ArrayType":
      return typeToString(type.type) + "[]";
    case "PrimitiveType":
    case "UnresolvedType":
      return type.name;
  }
}
