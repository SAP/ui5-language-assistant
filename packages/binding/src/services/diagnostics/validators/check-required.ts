import { findRange, findPrimitiveTypeInAggregation } from "../../../utils";
import {
  BindingIssue,
  BINDING_ISSUE_TYPE,
  BindingInfoElement,
} from "../../../types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { t } from "../../../i18n";
import { UI5Aggregation } from "@ui5-language-assistant/semantic-model-types";

export const checkRequiredElement = (
  element: BindingTypes.StructureValue,
  bindingElements: BindingInfoElement[],
  aggregation: UI5Aggregation | undefined
): BindingIssue[] => {
  // check required element
  const reqEl = bindingElements.find((i) => i.required);
  if (reqEl) {
    // check required element is applied
    let usedRequiredEl = element.elements.find(
      /* istanbul ignore next */
      (i) => i.key?.text === reqEl.name
    );
    const altTypes = findPrimitiveTypeInAggregation(aggregation);
    if (!usedRequiredEl && altTypes) {
      // some property e.g `tooltip` can be used with both `aggregation binding info` or `property binding info`. Therefore `altTypes` is defined in design time.
      // if `altTypes` is present, check if any element is used. This is a very broad check to avoid false diagnostic.
      usedRequiredEl = element.elements[0];
    }
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
