import { DEFAULT_NS, XMLElement } from "@xml-tools/ast";

export function xmlToFQN(astElement: XMLElement): string {
  // TODO: is this the optimal way to handle nameless elements?
  const baseName = astElement.name ? astElement.name : "";
  // if no NS is explicitly defined try the default one
  const prefixXmlns = astElement.ns ? astElement.ns : DEFAULT_NS;
  const resolvedXmlns = astElement.namespaces[prefixXmlns];

  if (resolvedXmlns !== undefined) {
    // Note that adding the 'dot' seems to be a UI5 semantic, not xmlns semantics
    // As those are mainly about simple text replacement.
    return resolvedXmlns + "." + baseName;
  } else {
    return baseName;
  }
}
