import { XMLElement } from "@xml-tools/ast";
import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
import { getClassByElement } from "../utils/filter-members";
import { ui5NodeToFQN } from "@vscode-ui5/logic-utils";

export function isElementApplicableForNamespaceSuggestions(
  element: XMLElement,
  ui5Model: UI5SemanticModel
): boolean {
  const clazz = getClassByElement(element, ui5Model);
  if (clazz === undefined) {
    return false;
  }
  const classFQN = ui5NodeToFQN(clazz);
  // we limit usage of namespaces attributes on "sap.ui.core.mvc.View" XML Element
  return classFQN === "sap.ui.core.mvc.View";
}
