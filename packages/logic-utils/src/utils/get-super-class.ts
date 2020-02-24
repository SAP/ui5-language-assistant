import { UI5Class } from "@vscode-ui5/semantic-model-types";

export function getSuperClasses(clazz: UI5Class): UI5Class[] {
  const superClasses = [];
  let currSuperClass = clazz.extends;
  while (currSuperClass !== undefined) {
    superClasses.push(currSuperClass);
    currSuperClass = currSuperClass.extends;
  }
  return superClasses;
}
