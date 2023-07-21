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
  extractBindingSyntax,
  isBindingExpression,
  isBindingAllowed,
  parseBinding,
  BindingParserTypes as bindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { Position, SemanticTokenTypes } from "vscode-languageserver-types";

import { buildAst, XMLAttribute, XMLElement } from "@xml-tools/ast";
import {
  getContext,
  isContext,
  Context,
} from "@ui5-language-assistant/context";
import { getUI5NodeByXMLAttribute } from "@ui5-language-assistant/logic-utils";

type BindingSemanticToken = SemanticTokenTypes | CustomSemanticToken;
interface SemanticToken {
  line: number;
  char: number;
  length: number;
  tokenType: number;
  tokenModifiers?: number;
}
const tokenTypes = new Map<BindingSemanticToken, number>();
enum CustomSemanticToken {
  null = "null",
  boolean = "boolean",
  bracket = "bracket",
}

const tokenTypesLegend: BindingSemanticToken[] = [
  SemanticTokenTypes.property,
  SemanticTokenTypes.string,
  SemanticTokenTypes.number,
  SemanticTokenTypes.operator,
  CustomSemanticToken.boolean,
  CustomSemanticToken.bracket,
  CustomSemanticToken.null,
];

tokenTypesLegend.forEach((tokenType, index) =>
  tokenTypes.set(tokenType, index)
);

const tokenModifiersLegend = [];
export const bindingLegend = new SemanticTokensLegend(
  tokenTypesLegend,
  tokenModifiersLegend
);
const getTokenType = (type: BindingSemanticToken): number =>
  tokenTypes.get(type) ?? 0;

const addSemanticToken = (
  binding:
    | bindingTypes.Value
    | bindingTypes.StructureElement
    | bindingTypes.PrimitiveValue
    | bindingTypes.Comma,
  semanticTokens: SemanticToken[] = []
) => {
  if (binding.type === "structure-element") {
    if (binding.key) {
      semanticTokens.push({
        line: binding.key.range.start.line,
        char: binding.key.range.start.character,
        length: binding.key.originalText.length,
        tokenType: getTokenType(SemanticTokenTypes.property),
      });
    }
    if (binding.colon) {
      semanticTokens.push({
        line: binding.colon.range.start.line,
        char: binding.colon.range.start.character,
        length:
          binding.colon.range.end.character -
          binding.colon.range.start.character,
        tokenType: getTokenType(SemanticTokenTypes.operator),
      });
    }
    if (binding.value) {
      addSemanticToken(binding.value, semanticTokens);
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
        tokenType: getTokenType(CustomSemanticToken.bracket),
      });
    }

    binding.elements.forEach((element) =>
      addSemanticToken(element, semanticTokens)
    );
    binding.commas?.forEach((comma) => addSemanticToken(comma, semanticTokens));
    if (binding.rightCurly) {
      semanticTokens.push({
        line: binding.rightCurly.range.start.line,
        char: binding.rightCurly.range.start.character,
        length:
          binding.rightCurly.range.end.character -
          binding.rightCurly.range.start.character,
        tokenType: getTokenType(CustomSemanticToken.bracket),
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
        tokenType: getTokenType(CustomSemanticToken.bracket),
      });
    }

    binding.elements.forEach((element) =>
      addSemanticToken(element, semanticTokens)
    );
    binding.commas?.forEach((comma) => addSemanticToken(comma, semanticTokens));
    if (binding.rightSquare) {
      semanticTokens.push({
        line: binding.rightSquare.range.start.line,
        char: binding.rightSquare.range.start.character,
        length:
          binding.rightSquare.range.end.character -
          binding.rightSquare.range.start.character,
        tokenType: getTokenType(CustomSemanticToken.bracket),
      });
    }
  }
  if (binding.type === "string-value") {
    semanticTokens.push({
      line: binding.range.start.line,
      char: binding.range.start.character,
      length: binding.range.end.character - binding.range.start.character,
      tokenType: getTokenType(SemanticTokenTypes.string),
    });
  }
  if (binding.type === "comma") {
    semanticTokens.push({
      line: binding.range.start.line,
      char: binding.range.start.character,
      length: binding.range.end.character - binding.range.start.character,
      tokenType: getTokenType(SemanticTokenTypes.operator),
    });
  }
  if (binding.type === "number-value") {
    semanticTokens.push({
      line: binding.range.start.line,
      char: binding.range.start.character,
      length: binding.range.end.character - binding.range.start.character,
      tokenType: getTokenType(SemanticTokenTypes.number),
    });
  }
  if (binding.type === "boolean-value") {
    semanticTokens.push({
      line: binding.range.start.line,
      char: binding.range.start.character,
      length: binding.range.end.character - binding.range.start.character,
      tokenType: getTokenType(CustomSemanticToken.boolean),
    });
  }
  if (binding.type === "null-value") {
    semanticTokens.push({
      line: binding.range.start.line,
      char: binding.range.start.character,
      length: binding.range.end.character - binding.range.start.character,
      tokenType: getTokenType(CustomSemanticToken.null),
    });
  }
};

const walkAttributes = (
  context: Context,
  attributes: XMLAttribute[],
  semanticTokens: SemanticToken[] = []
) => {
  for (const attr of attributes) {
    const ui5Node = getUI5NodeByXMLAttribute(attr, context.ui5Model);
    if (!ui5Node) {
      continue;
    }
    const value = attr.syntax.value;
    const text = attr.value ?? "";
    const extractedText = extractBindingSyntax(text);
    for (const bindingSyntax of extractedText) {
      const { expression, startIndex } = bindingSyntax;
      if (isBindingExpression(expression)) {
        continue;
      }
      const position: Position = {
        character: (value?.startColumn ?? 0) + startIndex,
        line: value?.startLine ? value.startLine - 1 : 0, // zero based index
      };
      const { ast, errors } = parseBinding(expression, position);
      for (const binding of ast.bindings) {
        if (!isBindingAllowed(expression, binding, errors)) {
          continue;
        }
        addSemanticToken(binding, semanticTokens);
      }
    }
  }
};

const walkElements = (
  context: Context,
  elements: XMLElement[],
  semanticTokens: SemanticToken[] = []
) => {
  for (const element of elements) {
    walkAttributes(context, element.attributes, semanticTokens);
    if (element.subElements) {
      walkElements(context, element.subElements, semanticTokens);
    }
  }
};

class BindingSemanticTokensProvider implements DocumentSemanticTokensProvider {
  async provideDocumentSemanticTokens(
    document: TextDocument
  ): Promise<SemanticTokens> {
    const semanticTokens: SemanticToken[] = [];
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
    walkElements(context, ast.rootElement.subElements, semanticTokens);
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
