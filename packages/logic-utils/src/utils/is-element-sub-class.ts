import { find } from "lodash";
import { UI5Class } from "@vscode-ui5/semantic-model-types";

import { ui5NodeToFQN } from "./ui5-node-to-fqn";
import { getSuperClasses } from "./get-super-class";

function isSubClass(
  superClassFqn: string,
  clazz: UI5Class | undefined
): clazz is UI5Class {
  if (clazz === undefined) {
    return false;
  }

  const superClasses = getSuperClasses(clazz);

  return (
    find(superClasses, _ => ui5NodeToFQN(_) === superClassFqn) !== undefined
  );
}

// Does not seem like Partial + Generics + Type Guards can be combined
// So the return type of a type guard function is converted to boolean
export function isElementSubClass(
  clazz: UI5Class | undefined
): clazz is UI5Class {
  return isSubClass("sap.ui.core.Element", clazz);
}
