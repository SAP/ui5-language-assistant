import {
  BindingIssue,
  BINDING_ISSUE_TYPE,
  BindingInfoName,
} from "../../../types";
import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
import { rangeToOffsetRange } from "../../../utils";
import { propertyBindingInfoElements } from "../../../definition/definition";

const search = (
  element: BindingTypes.AstElement,
  elements: BindingTypes.AstElement[],
  collectedElements: BindingTypes.AstElement[]
): BindingTypes.AstElement[] => {
  const notAllowedElements: BindingTypes.AstElement[] = [];
  const key = element.key?.text;
  const alreadyCollected = collectedElements.find(
    (item) => item.key?.text === key
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
  binding: BindingTypes.Binding
): BindingIssue[] => {
  const issues: BindingIssue[] = [];
  const notAllowed: BindingTypes.AstElement[] = [];
  const allEl = [...binding.elements];
  let oneElement: BindingTypes.AstElement[];
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
      offsetRange: rangeToOffsetRange(item.range),
      range: item.key?.range ?? item.range!,
      severity: "info",
    })
  );
  return issues;
};
