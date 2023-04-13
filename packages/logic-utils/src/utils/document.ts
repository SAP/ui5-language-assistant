export function isXMLView(uri: string): boolean {
  return /\.(view|fragment)\.xml$/.test(uri);
}
