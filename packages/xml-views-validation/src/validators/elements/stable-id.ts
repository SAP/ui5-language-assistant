import { XMLElement } from "@xml-tools/ast";
import { NonStableIDIssue } from "../../../api";
import {
  getUI5ClassByXMLElement,
  ui5NodeToFQN,
} from "@ui5-language-assistant/logic-utils";
import {
  UI5SemanticModel,
  UI5Class,
} from "@ui5-language-assistant/semantic-model-types";
import { setSettingsForDocument } from "@ui5-language-assistant/settings";
import { some } from "lodash";

export function validateStableId(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): NonStableIDIssue[] {
  const ui5Class = getUI5ClassByXMLElement(xmlElement, model);
  if (ui5Class === undefined) {
    return [];
  }

  const isException = isClassAnException(ui5Class);
  return [];
}

function isClassAnException(ui5Class: UI5Class): boolean {
  const rootClassExeptions = [
    "sap.ui.core.mvc.View",
    "sap.ui.core.View",
    "sap.ui.core.FragmentDefinition",
  ];
  // The class is in the root level
  if (ui5Class.parent === undefined) {
    return some(rootClassExeptions, (_) => _ === ui5NodeToFQN(ui5Class));
  }

  const classExceptions = [
    "sap.ui.core.Fragment",
    "sap.ui.core.CustomData",
    "sap.ui.core.ExtensionPoint",
  ];
  return some(classExceptions, (_) => _ === ui5NodeToFQN(ui5Class));
}
