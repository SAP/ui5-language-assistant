import { findRange } from "../../../utils";
import {
  BindingIssue,
  BINDING_ISSUE_TYPE,
  BindingInfoElement,
} from "../../../types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { t } from "../../../i18n";

export const checkRequiredElement = (
  element: BindingTypes.StructureValue,
  bindingElements: BindingInfoElement[]
): BindingIssue[] => {
  // check required element
  const reqEl = bindingElements.find((i) => i.required);
  if (reqEl) {
    // check required element is applied
    const usedRequiredEl = element.elements.find(
      /* istanbul ignore next */
      (i) => i.key?.text === reqEl.name
    );
    if (!usedRequiredEl) {
      return [
        {
          issueType: BINDING_ISSUE_TYPE,
          kind: "MandatoryProperty",
          message: t("MANDATORY_PROPERTY", { name: reqEl.name }),
          range: findRange([element.range, element.range]),
          severity: "error",
        },
      ];
    }
  }
  return [];
};
