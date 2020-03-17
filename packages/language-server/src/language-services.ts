import { resolve } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import fetch from "node-fetch";
import {
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocuments,
  CompletionItemTag
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { generate, Json, TypeNameFix } from "@vscode-ui5/semantic-model";
import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
import {
  XMLViewCompletion,
  getXMLViewCompletions
} from "@vscode-ui5/xml-views-completion";

export function getCompletionItems(
  model: UI5SemanticModel,
  textDocumentPosition: TextDocumentPositionParams,
  documents: TextDocuments<TextDocument>
): CompletionItem[] {
  const document = textDocumentPosition.textDocument.uri;
  const documentText = documents.get(document)?.getText() ?? "";
  const { cst, tokenVector } = parse(documentText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const suggestions = getXMLViewCompletions({
    model: model,
    offset: documents
      .get(document)
      ?.offsetAt(textDocumentPosition.position) as number,
    cst: cst as DocumentCstNode,
    ast: ast,
    tokenVector: tokenVector
  });

  return transformToLspSuggestions(suggestions);
}

function transformToLspSuggestions(
  suggestions: XMLViewCompletion[]
): CompletionItem[] {
  const lspSuggestions = suggestions.map(suggestion => {
    const completionItem: CompletionItem = {
      label: suggestion.ui5Node.name,
      detail: suggestion.ui5Node.description,
      data: suggestion.ui5Node.kind,
      tags: suggestion.ui5Node.deprecatedInfo
        ? [CompletionItemTag.Deprecated]
        : undefined
    };
    return completionItem;
  });
  return lspSuggestions;
}

export function addCompletionDetails(item: CompletionItem): CompletionItem {
  switch (item.data) {
    case "UI5Namespace":
      item.kind = CompletionItemKind.Text;
      break;
    case "UI5Prop":
      item.kind = CompletionItemKind.Property;
      break;
    case "UI5Class":
      item.kind = CompletionItemKind.Class;
      break;
    case "UI5Event":
      item.kind = CompletionItemKind.Event;
      break;
    case "UI5Aggregation":
      item.kind = CompletionItemKind.Text;
      break;
    case "UI5EnumValue":
      item.kind = CompletionItemKind.EnumMember;
      break;
    default:
      item.kind = CompletionItemKind.Text;
  }
  return item;
}

export async function getSemanticModel(): Promise<UI5SemanticModel> {
  const baseUrl =
    "https://sapui5-sapui5.dispatcher.us1.hana.ondemand.com/test-resources/";
  const suffix = "/designtime/api.json";
  const libs = [
    baseUrl + "sap/m" + suffix,
    baseUrl + "sap/f" + suffix,
    baseUrl + "sap/tnt" + suffix,
    baseUrl + "sap/ui/core" + suffix,
    baseUrl + "sap/ui/codeeditor" + suffix,
    baseUrl + "sap/ui/commons" + suffix,
    baseUrl + "sap/ui/dt" + suffix,
    baseUrl + "sap/ui/fl" + suffix,
    baseUrl + "sap/ui/layout" + suffix,
    baseUrl + "sap/ui/suite" + suffix,
    baseUrl + "sap/ui/support" + suffix,
    baseUrl + "sap/ui/unified" + suffix,
    baseUrl + "sap/ui/table" + suffix,
    //baseUrl + "sap/ui/uxap" + suffix,
    baseUrl + "sap/ui/ux3" + suffix
  ];

  const jsonMap: Record<string, Json> = {};
  const pathToDir = resolve(__dirname, "1.75.0");

  if (!existsSync(pathToDir)) {
    mkdirSync(pathToDir);
  }

  await Promise.all(
    libs.map(async url => {
      let libName =
        url.substring(baseUrl.length, url.length - suffix.length) + ".api.json";
      libName = libName.split("/").join(".");
      const response = await fetch(url);
      const json = await response.json();
      writeFileSync(resolve(pathToDir, libName), JSON.stringify(json));
      jsonMap[libName] = json;
    })
  );

  return generate({
    libraries: jsonMap,
    typeNameFix: getTypeNameFix(),
    strict: false
  });
}

function getTypeNameFix(): TypeNameFix {
  const fixes: TypeNameFix = {
    "sap.m.PlanningCalendarHeader": undefined,
    "sap.m.TimePickerSlider": "sap.m.TimePickerSliders",
    "sap.ui.fl.write._internal.transport.TransportDialog": undefined,
    "sap.ui.layout.cssgrid.IGridItemLayoutData": undefined,
    "sap.ui.layout.ResponsiveSplitterPage": undefined,
    "Object.<string,any>": undefined
  };
  return fixes;
}
