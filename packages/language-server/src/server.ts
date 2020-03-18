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
import { getCompletionItems, addCompletionDetails } from "./language-services";

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
    if (!isSemanticModelCreated) {
      return [];
    }
    return getCompletionItems(model, _textDocumentPosition, documents);
  }
);

connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    return addCompletionDetails(item);
  }
);

documents.listen(connection);

connection.listen();
