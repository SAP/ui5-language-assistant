import { values, pickBy, includes, flatMap } from "lodash";
import {
  UI5Class,
  UI5Interface,
  UI5SemanticModel
} from "@ui5-language-assistant/semantic-model-types";
import { getSuperClasses } from "./get-super-class";

export function findClassesMatchingType({
  type,
  model
}: {
  type: UI5Class | UI5Interface;
  model: UI5SemanticModel;
}): UI5Class[] {
  const matchingClasses = pickBy(model.classes, _ => classIsOfType(_, type));
  return values(matchingClasses);
}

function classIsOfType(
  clazz: UI5Class,
  type: UI5Class | UI5Interface
): boolean {
  const clazzAndSuperClasses = getSuperClasses(clazz).concat([clazz]);
  const superInterfaces = flatMap(clazzAndSuperClasses, _ => _.implements);

  return (
    includes(clazzAndSuperClasses, type) || includes(superInterfaces, type)
  );
}
