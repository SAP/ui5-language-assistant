import { XMLElement } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  getUI5ClassByXMLElement,
  ui5NodeToFQN,
} from "@ui5-language-assistant/logic-utils";
import { UseOfDeprecatedClassIssue } from "../../../api";
import { buildDeprecatedIssueMessage } from "../../utils/deprecated-message-builder";

export function validateUseOfDeprecatedClass(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): UseOfDeprecatedClassIssue[] {
  const ui5Class = getUI5ClassByXMLElement(xmlElement, model);
  if (ui5Class === undefined) {
    return [];
  }

  if (
    ui5Class.deprecatedInfo !== undefined &&
    // An issue lacking a position is not a useful issue...
    xmlElement.syntax.openName !== undefined
  ) {
    const deprecatedInfo = ui5Class.deprecatedInfo;
    const deprecatedIssue: UseOfDeprecatedClassIssue = {
      kind: "UseOfDeprecatedClass",
      message: buildDeprecatedIssueMessage({
        deprecatedInfo: deprecatedInfo,
        fqn: ui5NodeToFQN(ui5Class),
        ui5Kind: "Class",
      }),
      severity: "warn",
      offsetRange: {
        start: xmlElement.syntax.openName.startOffset,
        end: xmlElement.syntax.openName.endOffset,
      },
    };
    return [deprecatedIssue];
  }

  return [];
}
