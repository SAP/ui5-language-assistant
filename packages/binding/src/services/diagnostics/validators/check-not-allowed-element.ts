import {
  BindingIssue,
  BINDING_ISSUE_TYPE,
  BindingInfoName,
  BindingInfoElement,
} from "../../../types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { findRange } from "../../../utils";
import { t } from "../../../i18n";

const search = (
  bindingElements: BindingInfoElement[],
  element: BindingTypes.StructureElement,
  elements: BindingTypes.StructureElement[],
  collectedElements: BindingTypes.StructureElement[]
): BindingTypes.StructureElement[] => {
  const notAllowedElements: BindingTypes.StructureElement[] = [];
  const key = element.key?.text;
  const alreadyCollected = collectedElements.find(
    (item) => item.key?.text === key
  );
  if (alreadyCollected) {
    return [];
  }
  const propInfoElement = bindingElements.find((i) => i.name === key);
  if (!propInfoElement) {
    return [];
  }
  for (const item of elements) {
    const bindingName = item.key?.text as BindingInfoName;
    const notAllowed = propInfoElement.type.find((t) =>
      t.notAllowedElements.includes(bindingName)
    );
    if (notAllowed) {
      notAllowedElements.push(item);
    }
  }
  return notAllowedElements;
};
export const checkNotAllowedElement = (
  bindingElements: BindingInfoElement[],
  binding: BindingTypes.StructureValue
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const notAllowed: BindingTypes.StructureElement[] = [];
  const allEl = [...binding.elements];
  let oneElement: BindingTypes.StructureElement[];
  while ((oneElement = allEl.splice(0, 1)) && allEl.length > 0) {
    const searchResult = search(
      bindingElements,
      oneElement[0],
      allEl,
      notAllowed
    );
    if (searchResult.length > 0) {
      // add element itself too
      notAllowed.push(...oneElement);
    }
    notAllowed.push(...searchResult);
  }
  const keys = notAllowed.map((item) => item.key?.originalText);
  notAllowed.forEach((item) =>
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "NotAllowedProperty",
      message: t("ONE_OF_THESE_ELEMENTS", { data: keys.join(t("COMMA")) }),
      range: findRange([
        /* istanbul ignore next */
        item.key?.range,
        item.range,
      ]),
      severity: "info",
    })
  );
  return issues;
};
