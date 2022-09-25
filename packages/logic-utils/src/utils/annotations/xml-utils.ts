import { XMLElement } from "@xml-tools/ast";

export function getRootElement(element: XMLElement): XMLElement {
  let current: XMLElement = element;
  while (current.parent.type === "XMLElement") {
    current = current.parent;
  }
  return current;
}

export function getElementAttributeValue(
  element: XMLElement,
  attributeName: string
): string | null | undefined {
  return element.attributes.find((attribute) => attribute.key === attributeName)
    ?.value;
}
