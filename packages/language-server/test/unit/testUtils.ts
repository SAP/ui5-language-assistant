import { TextDocument, Position } from "vscode-languageserver";

export function xmlSnippetToDocument(xmlSnippet: string): {
  document: TextDocument;
  position: Position;
} {
  const xmlText = xmlSnippet.replace("⇶", "");
  const offset = xmlSnippet.indexOf("⇶");
  const document: TextDocument = createTextDocument("xml", xmlText);
  const position: Position = document.positionAt(offset);
  return { document, position };
}

function createTextDocument(languageId: string, content: string): TextDocument {
  return TextDocument.create("uri", languageId, 0, content);
}
