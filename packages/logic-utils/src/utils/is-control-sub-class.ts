import { UI5Class } from "@vscode-ui5/semantic-model";
import { find } from "lodash";

import { ui5NodeToFQN } from "./ui5-node-to-fqn";
import { getSuperClasses } from "./get-super-class";

export function isControlSubClass(clazz: UI5Class): boolean {
  const superClasses = getSuperClasses(clazz);
  const hasControlAsSuperClass =
    find(superClasses, _ => ui5NodeToFQN(_) === "sap.ui.core.Control") !==
    undefined;

  return hasControlAsSuperClass;
}
