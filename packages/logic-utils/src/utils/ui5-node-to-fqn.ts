import { BaseUI5Node } from "@vscode-ui5/semantic-model";

export function ui5NodeToFQN(ui5Node: BaseUI5Node): string {
  const nameParts = [];
  let currNode = ui5Node;
  while (currNode !== undefined) {
    nameParts.push(currNode.name);
    currNode = currNode.parent;
  }

  const fqn = nameParts.reverse().join(".");
  return fqn;
}
