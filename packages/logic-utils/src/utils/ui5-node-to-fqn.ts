import { BaseUI5Node } from "@vscode-ui5/semantic-model-types";

export function ui5NodeToFQN(ui5Node: BaseUI5Node): string {
  const nameParts = [];
  let currNode: BaseUI5Node | undefined = ui5Node;
  while (currNode !== undefined) {
    nameParts.push(currNode.name);
    currNode = currNode.parent;
  }

  const fqn = nameParts.reverse().join(".");
  return fqn;
}
