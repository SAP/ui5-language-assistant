import { values, pickBy, includes } from "lodash";
import {
  UI5Class,
  UI5Interface,
  UI5SemanticModel
} from "@vscode-ui5/semantic-model-types";
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
  /* istanbul ignore else */
  if (type.kind === "UI5Class") {
    if (clazz === type) {
      return true;
    }
    const superClasses = getSuperClasses(clazz);
    return includes(superClasses, type);
  } else if (type.kind === "UI5Interface") {
    // interfaces in UI5 do not have their own inheritance graph so a direct check is sufficient.
    // TODO: Is transitive interface inheritance via classes viable in the UI5 model?
    return includes(clazz.implements, type);
  } else {
    throw Error(`non exhaustive match, unknown type: ${JSON.stringify(type)}`);
  }
}
