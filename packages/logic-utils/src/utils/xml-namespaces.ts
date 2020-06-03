import { XMLElement, DEFAULT_NS } from "@xml-tools/ast";

export function resolveXMLNS(xmlElement: XMLElement): string | undefined {
  return resolveXMLNSFromPrefix(xmlElement.ns, xmlElement);
}

export function resolveXMLNSFromPrefix(
  prefix: string | undefined,
  xmlElement: XMLElement
): string | undefined {
  // If no NS is explicitly defined try the default one
  const prefixXmlns = prefix ?? DEFAULT_NS;
  const resolvedXmlns = xmlElement.namespaces[prefixXmlns];
  return resolvedXmlns;
}

export function isSameXMLNS(
  xmlElement1: XMLElement,
  xmlElement2: XMLElement
): boolean {
  return isSameXMLNSFromPrefix(
    xmlElement1.ns,
    xmlElement1,
    xmlElement2.ns,
    xmlElement2
  );
}

export function isSameXMLNSFromPrefix(
  prefix1: string | undefined,
  xmlElement1: XMLElement,
  prefix2: string | undefined,
  xmlElement2: XMLElement
): boolean {
  // It's possible to re-define namespaces, so we can't rely on the namespace prefix to check this.
  // It's also possible to define several prefixes for the same namespace.

  // If the prefixes are resolved to the same namespace, they are the same
  const ns1 = resolveXMLNSFromPrefix(prefix1, xmlElement1);
  const ns2 = resolveXMLNSFromPrefix(prefix2, xmlElement2);
  if (ns1 === ns2 && ns1 !== undefined) {
    return true;
  }

  // If both prefixes are not defined but they are the same string we also consider them the same
  if (ns1 === undefined && ns2 === undefined && prefix1 === prefix2) {
    return true;
  }

  return false;
}
