// The xml parser takes care of validating the attribute name.
// If the user started the attribute name with "xmlns:" we can assume that
// they meant for it to be an xml namespace attribute.
// xmlns attributes explicitly can't contain ":" after the "xmlns:" part.
const namespaceRegex = /^xmlns(:(?<prefix>[^:=]*))?$/;

export function isXMLNamespaceKey(key: string): boolean {
  return key.match(namespaceRegex) !== null;
}

export function getXMLNamespaceKeyPrefix(key: string): string {
  const matchArr = key.match(namespaceRegex);
  return matchArr?.groups?.prefix ?? "";
}
