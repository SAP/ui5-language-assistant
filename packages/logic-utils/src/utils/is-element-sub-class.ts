import { find, partial } from "lodash";
import { UI5Class } from "@vscode-ui5/semantic-model-types";

import { ui5NodeToFQN } from "./ui5-node-to-fqn";
import { getSuperClasses } from "./get-super-class";

function isSubClass(
  superClassFqn: string,
  clazz: UI5Class | undefined
): boolean {
  if (clazz === undefined) {
    return false;
  }

  const superClasses = getSuperClasses(clazz);

  return (
    find(superClasses, _ => ui5NodeToFQN(_) === superClassFqn) !== undefined
  );
}

export const isElementSubClass = partial(isSubClass, "sap.ui.core.Element");
