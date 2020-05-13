/* istanbul ignore file */
import {
  createConnection,
  TextDocuments,
  TextDocumentSyncKind,
  ProposedFeatures,
  TextDocumentPositionParams,
  CompletionItem,
  InitializeParams,
  Hover,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getSemanticModel } from "./ui5-model";
import { getCompletionItems } from "./completion-items";
import { ServerInitializationOptions } from "../api";
import { getXMLViewDiagnostics } from "./xml-view-diagnostics";
import { getHoverContext } from "./hover";

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
        triggerCharacters: ['"', "'", ":", "<"],
      },
      hoverProvider: true,
    },
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

connection.onHover(
  async (
    textDocumentPosition: TextDocumentPositionParams
  ): Promise<Hover | undefined> => {
    if (getSemanticModelPromise !== undefined) {
      const model = await getSemanticModelPromise;
      const documentUri = textDocumentPosition.textDocument.uri;
      const document = documents.get(documentUri);
      if (document) {
        return getHoverContext(model, textDocumentPosition, document);
      }
    }
    return undefined;
  }
);

connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    return item;
  }
);

documents.onDidChangeContent(async (changeEvent) => {
  if (getSemanticModelPromise === undefined) {
    return;
  }
  const ui5Model = await getSemanticModelPromise;
  // TODO: should we check we are dealing with a *.[view|fragment].xml?
  //       The client does this, but perhaps we should be extra defensive in case of
  //       additional clients.
  const documentUri = changeEvent.document.uri;
  const document = documents.get(documentUri);
  if (document !== undefined) {
    const diagnostics = getXMLViewDiagnostics({ document, ui5Model });
    connection.sendDiagnostics({ uri: changeEvent.document.uri, diagnostics });
  }
});

documents.listen(connection);

connection.listen();
