import {
  createConnection,
  TextDocuments,
  TextDocumentSyncKind,
  ProposedFeatures,
  TextDocumentPositionParams,
  CompletionItem
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types";
import { getSemanticModel } from "./ui5-model";
import { getCompletionItems } from "./language-services";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
let model: UI5SemanticModel;
let isSemanticModelCreated = false;

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['"', "'", ":", "<"]
      }
    }
  };
});

connection.onInitialized(async () => {
  model = await getSemanticModel();
  if (model) {
    isSemanticModelCreated = true;
  }
});

connection.onCompletion(
  async (
    _textDocumentPosition: TextDocumentPositionParams
  ): Promise<CompletionItem[]> => {
    if (isSemanticModelCreated) {
      const documentUri = _textDocumentPosition.textDocument.uri;
      const document = documents.get(documentUri);
      if (document) {
        return getCompletionItems(model, _textDocumentPosition, document);
      }
    }
    return [];
  }
);

connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    return item;
  }
);

documents.listen(connection);

connection.listen();
