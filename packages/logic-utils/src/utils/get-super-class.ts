import { UI5Class } from "@ui5-language-assistant/semantic-model-types";

export function getSuperClasses(clazz: UI5Class): UI5Class[] {
  const visited: Set<UI5Class> = new Set();
  const superClasses: UI5Class[] = [];

  let currSuperClass = clazz.extends;
  while (currSuperClass !== undefined && !visited.has(currSuperClass)) {
    visited.add(currSuperClass);
    superClasses.push(currSuperClass);
    currSuperClass = currSuperClass.extends;
  }
  return superClasses;
}
