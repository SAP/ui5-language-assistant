import { XMLElement } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { xmlToFQN } from "@ui5-language-assistant/logic-utils";
import { UseOfDeprecatedClassIssue } from "../../../api";
import { buildDeprecatedIssueMessage } from "../../utils/deprecated-message-builder";

export function validateUseOfDeprecatedClass(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): UseOfDeprecatedClassIssue[] {
  const elementTagFqn = xmlToFQN(xmlElement);
  const ui5Class = model.classes[elementTagFqn];
  if (ui5Class === undefined) {
    return [];
  }

  if (
    ui5Class.deprecatedInfo !== undefined &&
    // An issue without a position is not a useful issue...
    (xmlElement.syntax.openName !== undefined ||
      /* istanbul ignore next - defensive programing for (currently) none reproducible scenario */
      //   We can't reach this branch because if openName does not exist, the FQN would not exist either
      //   and thus the `ui5Class.deprecatedInfo` would not be found.
      xmlElement.syntax.closeName !== undefined)
  ) {
    const deprecatedInfo = ui5Class.deprecatedInfo;
    const issues: UseOfDeprecatedClassIssue[] = [];

    const deprecatedIssue: UseOfDeprecatedClassIssue = {
      kind: "UseOfDeprecatedClass" as "UseOfDeprecatedClass",
      message: buildDeprecatedIssueMessage({
        deprecatedInfo: deprecatedInfo,
        fqn: elementTagFqn,
        ui5Kind: "Class"
      }),
      severity: "warn" as "warn",
      offsetRanges: []
    };

    /* istanbul ignore else - defensive programing for (currently) none reproducible scenario */
    //   `syntax.openName` will always exist, otherwise we could not resolve
    //   `xmlToFQN(xmlElement)` because if syntax.openName does not exist
    //   the xmlElement.name property would not exist either.
    if (xmlElement.syntax.openName !== undefined) {
      deprecatedIssue.offsetRanges.push({
        start: xmlElement.syntax.openName.startOffset,
        end: xmlElement.syntax.openName.endOffset
      });
    }

    if (xmlElement.syntax.closeName !== undefined) {
      deprecatedIssue.offsetRanges.push({
        start: xmlElement.syntax.closeName.startOffset,
        end: xmlElement.syntax.closeName.endOffset
      });
    }

    issues.push(deprecatedIssue);
    return issues;
  }

  return [];
}
