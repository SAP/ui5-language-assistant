import { BaseUI5Node } from "@ui5-editor-tools/semantic-model-types";

export function isRootSymbol(node: BaseUI5Node): boolean {
  switch (node.kind) {
    case "UI5Class":
    case "UI5Enum":
    case "UI5Namespace":
    case "UI5Interface":
    case "UI5Typedef":
    case "UI5Function":
      return true;
    default:
      return false;
  }
}

export function getRootSymbolParent(
  node: BaseUI5Node
): BaseUI5Node | undefined {
  let current: BaseUI5Node | undefined = node;
  while (current !== undefined && !isRootSymbol(current)) {
    current = node.parent;
  }
  return current;
}
