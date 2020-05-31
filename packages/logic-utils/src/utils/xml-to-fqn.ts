import { XMLElement } from "@xml-tools/ast";
import { resolveXMLNS } from "../api";

export function xmlToFQN(astElement: XMLElement): string {
  // TODO: is this the optimal way to handle nameless elements?
  const baseName = astElement.name ?? "";
  const resolvedXmlns = resolveXMLNS(astElement);

  if (resolvedXmlns !== undefined) {
    // Note that adding the 'dot' seems to be a UI5 semantic, not xmlns semantics
    // As those are mainly about simple text replacement.
    return resolvedXmlns + "." + baseName;
  } else {
    return baseName;
  }
}
