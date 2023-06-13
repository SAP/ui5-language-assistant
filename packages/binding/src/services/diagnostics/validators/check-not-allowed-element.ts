import {
  BindingIssue,
  BINDING_ISSUE_TYPE,
  BindingInfoName,
} from "../../../types";
import { BindingParserTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { findRange, clearKey } from "../../../utils";
import { propertyBindingInfoElements } from "../../../definition/definition";

const search = (
  element: BindingTypes.StructureElement,
  elements: BindingTypes.StructureElement[],
  collectedElements: BindingTypes.StructureElement[]
): BindingTypes.StructureElement[] => {
  const notAllowedElements: BindingTypes.StructureElement[] = [];
  const key = clearKey(element.key?.text);
  const alreadyCollected = collectedElements.find(
    (item) => clearKey(item.key?.text) === key
  );
  if (alreadyCollected) {
    return [];
  }
  const propInfoElement = propertyBindingInfoElements.find(
    (i) => i.name === key
  );
  if (!propInfoElement) {
    return [];
  }
  for (const item of elements) {
    const bindingName = clearKey(item.key?.text) as BindingInfoName;
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
  binding: BindingTypes.StructureValue
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const notAllowed: BindingTypes.StructureElement[] = [];
  const allEl = [...binding.elements];
  let oneElement: BindingTypes.StructureElement[];
  while ((oneElement = allEl.splice(0, 1)) && allEl.length > 0) {
    const searchResult = search(oneElement[0], allEl, notAllowed);
    if (searchResult.length > 0) {
      // add element itself too
      notAllowed.push(...oneElement);
    }
    notAllowed.push(...searchResult);
  }
  const keys = notAllowed.map((item) => item.key?.text);
  notAllowed.forEach((item) =>
    issues.push({
      issueType: BINDING_ISSUE_TYPE,
      kind: "NotAllowedProperty",
      message: `One of these elements [${keys.join(", ")}] are allowed`,
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
