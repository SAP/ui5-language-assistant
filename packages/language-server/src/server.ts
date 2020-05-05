/* istanbul ignore file */
import {
  createConnection,
  TextDocuments,
  TextDocumentSyncKind,
  ProposedFeatures,
  TextDocumentPositionParams,
  CompletionItem,
  InitializeParams
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getSemanticModel } from "./ui5-model";
import { getCompletionItems } from "./completion-items";
import { ServerInitializationOptions } from "../api";
import { getXMLViewDiagnostics } from "./xml-view-diagnostics";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
let getSemanticModelPromise: Promise<UI5SemanticModel> | undefined = undefined;
let initializationOptions: ServerInitializationOptions | undefined;

connection.onInitialize((params: InitializeParams) => {
  // These options are passed from the client extension in clientOptions.initializationOptions
  initializationOptions = params.initializationOptions;
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: {
        resolveProvider: true,
        // TODO: can the trigger characters be more contextual?
        //       e.g: "<" of open tag only, not else where
        triggerCharacters: ['"', "'", ":", "<"]
      }
    }
  };
});

connection.onInitialized(async () => {
  getSemanticModelPromise = getSemanticModel(
    initializationOptions?.modelCachePath
  );
});

connection.onCompletion(
  async (
    textDocumentPosition: TextDocumentPositionParams
  ): Promise<CompletionItem[]> => {
    if (getSemanticModelPromise !== undefined) {
      const model = await getSemanticModelPromise;
      const documentUri = textDocumentPosition.textDocument.uri;
      const document = documents.get(documentUri);
      if (document) {
        return getCompletionItems(model, textDocumentPosition, document);
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

documents.onDidChangeContent(async changeEvent => {
  // TODO: can we ensure the promise has always been initialized first (never be undefined)?
  if (getSemanticModelPromise === undefined) {
    return;
  }
  // TODO: how to debounce this? should we debounce this?
  const ui5Model = await getSemanticModelPromise;
  // TODO: should we check we are dealing with a *.[view|fragment].xml?
  const documentUri = changeEvent.document.uri;
  const document = documents.get(documentUri);
  if (document !== undefined) {
    const diagnostics = getXMLViewDiagnostics({ document, ui5Model });
    connection.sendDiagnostics({ uri: changeEvent.document.uri, diagnostics });
  }
});

documents.listen(connection);

connection.listen();
