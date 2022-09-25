import { XMLElement } from "@xml-tools/ast";
import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import { getUI5ClassByXMLElement } from "@ui5-language-assistant/logic-utils";
import { UseOfDeprecatedClassIssue } from "../../../api";
import {
  buildDeprecatedIssueMessage,
  DeprecatedUI5Symbol,
} from "../../utils/deprecated-message-builder";

export function validateUseOfDeprecatedClass(
  xmlElement: XMLElement,
  context: AppContext
): UseOfDeprecatedClassIssue[] {
  const ui5Class = getUI5ClassByXMLElement(xmlElement, context.ui5Model);
  if (ui5Class === undefined) {
    return [];
  }

  if (
    ui5Class.deprecatedInfo !== undefined &&
    // An issue lacking a position is not a useful issue...
    xmlElement.syntax.openName !== undefined
  ) {
    const deprecatedIssue: UseOfDeprecatedClassIssue = {
      kind: "UseOfDeprecatedClass",
      message: buildDeprecatedIssueMessage({
        symbol: ui5Class as DeprecatedUI5Symbol,
        model: context.ui5Model,
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
