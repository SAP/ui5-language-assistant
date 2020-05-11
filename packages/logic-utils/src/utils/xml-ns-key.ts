// The prefix is an xml name minus the ":"
const namespaceRegex = /^xmlns(:(?<prefix>[^:=]*))?$/;

export function isXMLNamespaceKey(key: string): boolean {
  return key.match(namespaceRegex) !== null;
}

export function getXMLNamespaceKeyPrefix(key: string): string {
  const matchArr = key.match(namespaceRegex);
  return matchArr?.groups?.prefix ?? "";
}
