import { XMLElement } from "@xml-tools/ast";
import { UseOfDeprecatedClassIssue } from "../../../api";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { xmlToFQN } from "@ui5-language-assistant/logic-utils";

export function validateUseOfDeprecatedClass(
  xmlElement: XMLElement,
  model: UI5SemanticModel
): UseOfDeprecatedClassIssue[] {
  const elementTagFqn = xmlToFQN(xmlElement);
  const ui5Class = model.classes[elementTagFqn];
  if (ui5Class === undefined) {
    return [];
  }

  if (ui5Class.deprecatedInfo !== undefined) {
    const issues: UseOfDeprecatedClassIssue[] = [];
    const commonIssueFields: UseOfDeprecatedClassIssue = {
      kind: "UseOfDeprecatedClass",
      message: `Deprecated UI5 Class: ${elementTagFqn} used.`,
      severity: "warn",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      range: undefined as any
    };

    /* istanbul ignore else - defensive programing for (currently) none reproducible scenario */
    //   `syntax.openName` will always exist, otherwise we could not resolve
    //   `xmlToFQN(xmlElement)` because if syntax.openName does not exist
    //   the xmlElement.name property would not exist either.
    if (xmlElement.syntax.openName !== undefined) {
      issues.push({
        ...commonIssueFields,
        range: {
          start: xmlElement.syntax.openName.startOffset,
          end: xmlElement.syntax.openName.endOffset
        }
      });
    }

    if (xmlElement.syntax.closeName !== undefined) {
      issues.push({
        ...commonIssueFields,
        range: {
          start: xmlElement.syntax.closeName.startOffset,
          end: xmlElement.syntax.closeName.endOffset
        }
      });
    }

    return issues;
  }

  return [];
}
