import {
  TextDocument,
  SemanticTokens,
  SemanticTokensBuilder,
  DocumentSemanticTokensProvider,
  SemanticTokensLegend,
} from "vscode";
import { URI } from "vscode-uri";
import { CancellationToken } from "vscode-languageclient/node";
import {
  extractBindingExpression,
  isBindingExpression,
  isPropertyBindingInfo,
  parseBinding,
  BindingParserTypes as bindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import type { Position } from "vscode-languageserver-types";

import {
  buildAst,
  DEFAULT_NS,
  SourcePosition,
  XMLAttribute,
  XMLElement,
  XMLDocument,
} from "@xml-tools/ast";
import {
  initializeManifestData,
  initializeUI5YamlData,
  reactOnUI5YamlChange,
  getCDNBaseUrl,
  getContext,
  reactOnManifestChange,
  reactOnCdsFileChange,
  reactOnXmlFileChange,
  reactOnPackageJson,
  isContext,
  Context,
} from "@ui5-language-assistant/context";
import {
  getUI5PropertyByXMLAttributeKey,
  getUI5AggregationByXMLElement,
  getUI5NodeByXMLAttribute,
} from "@ui5-language-assistant/logic-utils";

interface SemanticToken {
  line: number;
  char: number;
  length: number;
  tokenType: number;
  tokenModifiers?: number;
}
let semanticTokens: SemanticToken[] = [];
const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

// const tokenTypesLegend = [
//   "decorator",
//   "keyword",
//   "label",
//   "property",
//   "macro",
//   "string",
// ];
const tokenTypesLegend = [
  "comment",
  "string",
  "keyword",
  "number",
  "regexp",
  "operator",
  "namespace",
  "type",
  "struct",
  "class",
  "interface",
  "enum",
  "typeParameter",
  "function",
  "method",
  "decorator",
  "macro",
  "variable",
  "parameter",
  "property",
  "label",
];

tokenTypesLegend.forEach((tokenType, index) =>
  tokenTypes.set(tokenType, index)
);

const tokenModifiersLegend = [
  "declaration",
  "documentation",
  "readonly",
  "static",
  "abstract",
  "deprecated",
  "modification",
  "async",
];
// const tokenModifiersLegend = ["static", "private", "async"];
tokenModifiersLegend.forEach((tokenModifier, index) =>
  tokenModifiers.set(tokenModifier, index + 1)
);

export const bindingLegend = new SemanticTokensLegend(
  tokenTypesLegend,
  tokenModifiersLegend
);

const addSemanticToken = (
  binding:
    | bindingTypes.Value
    | bindingTypes.StructureElement
    | bindingTypes.PrimitiveValue
    | bindingTypes.Comma
) => {
  if (binding.type === "structure-element") {
    if (binding.key) {
      semanticTokens.push({
        line: binding.key.range.start.line,
        char: binding.key.range.start.character,
        length: binding.key.text.length,
        tokenType: tokenTypes.get("property") ?? 0,
        tokenModifiers: tokenModifiers.get("declaration"),
      });
    }
    if (binding.colon) {
      semanticTokens.push({
        line: binding.colon.range.start.line,
        char: binding.colon.range.start.character,
        length:
          binding.colon.range.end.character -
          binding.colon.range.start.character,
        tokenType: tokenTypes.get("decorator") ?? 0,
        tokenModifiers: tokenModifiers.get("readonly"),
      });
    }
    if (binding.value) {
      addSemanticToken(binding.value);
    }
  }
  if (binding.type === "structure-value") {
    if (binding.leftCurly) {
      semanticTokens.push({
        line: binding.leftCurly.range.start.line,
        char: binding.leftCurly.range.start.character,
        length:
          binding.leftCurly.range.end.character -
          binding.leftCurly.range.start.character,
        tokenType: tokenTypes.get("decorator") ?? 0,
      });
    }

    binding.elements.forEach((element) => addSemanticToken(element));
    binding.commas?.forEach((comma) => addSemanticToken(comma));
    if (binding.rightCurly) {
      semanticTokens.push({
        line: binding.rightCurly.range.start.line,
        char: binding.rightCurly.range.start.character,
        length:
          binding.rightCurly.range.end.character -
          binding.rightCurly.range.start.character,
        tokenType: tokenTypes.get("decorator") ?? 0,
      });
    }
  }
  if (binding.type === "collection-value") {
    if (binding.leftSquare) {
      semanticTokens.push({
        line: binding.leftSquare.range.start.line,
        char: binding.leftSquare.range.start.character,
        length:
          binding.leftSquare.range.end.character -
          binding.leftSquare.range.start.character,
        tokenType: tokenTypes.get("decorator") ?? 0,
        tokenModifiers: tokenModifiers.get("static"),
      });
    }

    binding.elements.forEach((element) => addSemanticToken(element));
    binding.commas?.forEach((comma) => addSemanticToken(comma));
    if (binding.rightSquare) {
      semanticTokens.push({
        line: binding.rightSquare.range.start.line,
        char: binding.rightSquare.range.start.character,
        length:
          binding.rightSquare.range.end.character -
          binding.rightSquare.range.start.character,
        tokenType: tokenTypes.get("decorator") ?? 0,
        tokenModifiers: tokenModifiers.get("static"),
      });
    }
  }
  if (binding.type === "string-value") {
    semanticTokens.push({
      line: binding.range.start.line,
      char: binding.range.start.character,
      length: binding.range.end.character - binding.range.start.character,
      tokenType: tokenTypes.get("string") ?? 0,
      tokenModifiers: tokenModifiers.get("static"),
    });
  }
  if (binding.type === "comma") {
    semanticTokens.push({
      line: binding.range.start.line,
      char: binding.range.start.character,
      length: binding.range.end.character - binding.range.start.character,
      tokenType: tokenTypes.get("decorator") ?? 0,
      tokenModifiers: tokenModifiers.get("readonly"),
    });
  }
  if (
    binding.type === "boolean-value" ||
    binding.type === "null-value" ||
    binding.type === "number-value"
  ) {
    semanticTokens.push({
      line: binding.range.start.line,
      char: binding.range.start.character,
      length: binding.range.end.character - binding.range.start.character,
      tokenType: tokenTypes.get("macro") ?? 0,
      tokenModifiers: tokenModifiers.get("static"),
    });
  }
};

const walkAttributes = (context: Context, attributes: XMLAttribute[]) => {
  for (const attr of attributes) {
    const ui5Node = getUI5NodeByXMLAttribute(attr, context.ui5Model);
    if (!ui5Node) {
      continue;
    }
    const value = attr.syntax.value;
    const text = attr.value ?? "";
    const extractedText = extractBindingExpression(text);
    for (const bindingSyntax of extractedText) {
      const { expression, startIndex } = bindingSyntax;
      if (isBindingExpression(expression)) {
        continue;
      }
      const position: Position = {
        character: (value?.startColumn ?? 0) + startIndex,
        line: value?.startLine ? value.startLine - 1 : 0, // zero based index
      };
      const { ast } = parseBinding(expression, position);
      for (const binding of ast.bindings) {
        if (!isPropertyBindingInfo(expression, binding)) {
          continue;
        }
        addSemanticToken(binding);
      }
    }
  }
};

const walkElements = (context: Context, elements: XMLElement[]) => {
  for (const element of elements) {
    walkAttributes(context, element.attributes);
    const ui5Aggregation = getUI5AggregationByXMLElement(
      element,
      context.ui5Model
    );
    if (ui5Aggregation) {
      console.log(ui5Aggregation);
    }
    if (element.subElements) {
      walkElements(context, element.subElements);
    }
  }
};

class BindingSemanticTokensProvider implements DocumentSemanticTokensProvider {
  async provideDocumentSemanticTokens(
    document: TextDocument,
    token: CancellationToken
  ): Promise<SemanticTokens> {
    semanticTokens = [];
    const builder = new SemanticTokensBuilder();
    const documentUri = document.uri.toString();
    const documentPath = URI.parse(documentUri).fsPath;
    const context = await getContext(documentPath);
    if (!isContext(context)) {
      return builder.build();
    }
    const documentText = document.getText();
    const { cst, tokenVector } = parse(documentText);
    const ast = buildAst(cst as DocumentCstNode, tokenVector);
    if (!ast.rootElement) {
      return builder.build();
    }
    walkElements(context, ast.rootElement.subElements);
    semanticTokens.forEach((item) =>
      builder.push(
        item.line,
        item.char,
        item.length,
        item.tokenType,
        item.tokenModifiers
      )
    );
    return builder.build();
  }
}

export const bindingSemanticTokensProvider =
  new BindingSemanticTokensProvider();
