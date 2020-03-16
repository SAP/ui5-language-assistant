import { UI5Class } from "@ui5-editor-tools/semantic-model-types";

export function getSuperClasses(clazz: UI5Class): UI5Class[] {
  // TODO: should we ensure this code never goes into infinite loops?
  const superClasses = [];
  let currSuperClass = clazz.extends;
  while (currSuperClass !== undefined) {
    superClasses.push(currSuperClass);
    currSuperClass = currSuperClass.extends;
  }
  return superClasses;
}
