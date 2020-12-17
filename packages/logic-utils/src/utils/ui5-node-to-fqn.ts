import { BaseUI5Node } from "@ui5-language-assistant/semantic-model-types";

export function ui5NodeToFQN(ui5Node: BaseUI5Node): string {
  const nameParts: string[] = [];
  let currNode: BaseUI5Node | undefined = ui5Node;
  while (currNode !== undefined) {
    nameParts.push(currNode.name);
    currNode = currNode.parent;
  }

  const fqn = nameParts.reverse().join(".");
  return fqn;
}
