import { last } from "lodash";
import { UI5Namespace } from "@ui5-editor-tools/semantic-model-types";
import { ui5NodeToFQN } from "@ui5-editor-tools/logic-utils";

export function getUI5NamespaceLastName(namespace: UI5Namespace): string {
  const namespaceFQN = ui5NodeToFQN(namespace);
  const namespaceFQNSplit = namespaceFQN.split(".");
  return last(namespaceFQNSplit) ?? "";
}
