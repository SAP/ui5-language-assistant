//we are only allowing word (\w+) characters in prefixes now (in completions)
//TODO it should be aligned with the full XML spec
const namespaceRegex = /^xmlns(:(?<prefix>\w*))?$/;

export function isXMLNamespaceKey(key: string): boolean {
  return key.match(namespaceRegex) !== null;
}

export function getXMLNamespaceKeyPrefix(key: string): string {
  const matchArr = key.match(namespaceRegex);
  return matchArr?.groups?.prefix ?? "";
}
