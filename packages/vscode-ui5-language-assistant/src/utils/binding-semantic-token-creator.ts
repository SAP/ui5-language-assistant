import { URI } from "vscode-uri";
import {
  getContext,
  isContext,
  Context,
} from "@ui5-language-assistant/context";
import {
  extractBindingSyntax,
  isBindingExpression,
  isBindingAllowed,
  parseBinding,
  BindingParserTypes as bindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { getBindingElements } from "@ui5-language-assistant/binding";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import {
  getUI5AggregationByXMLAttributeKey,
  getUI5NodeByXMLAttribute,
  isXMLView,
} from "@ui5-language-assistant/logic-utils";
import { buildAst, XMLAttribute, XMLElement } from "@xml-tools/ast";
import { Position, SemanticTokenTypes } from "vscode-languageserver-types";

interface SemanticToken {
  line: number;
  char: number;
  length: number;
  tokenType: number;
  tokenModifiers?: number;
}
export enum CustomSemanticToken {
  null = "null",
  boolean = "boolean",
  bracket = "bracket",
}
const tokenTypes = new Map<BindingSemanticToken, number>();

export const tokenTypesLegend: BindingSemanticToken[] = [
  SemanticTokenTypes.property,
  SemanticTokenTypes.string,
  SemanticTokenTypes.number,
  SemanticTokenTypes.operator,
  CustomSemanticToken.boolean,
  CustomSemanticToken.bracket,
  CustomSemanticToken.null,
];

type BindingSemanticToken = SemanticTokenTypes | CustomSemanticToken;

tokenTypesLegend.forEach((tokenType, index) =>
  tokenTypes.set(tokenType, index)
);

export const getTokenType = (type: BindingSemanticToken): number =>
  /* istanbul ignore next */
  tokenTypes.get(type) ?? 0;

const getSemanticToken = (
  binding:
    | bindingTypes.Value
    | bindingTypes.StructureElement
    | bindingTypes.PrimitiveValue
    | bindingTypes.Comma
): SemanticToken[] => {
  const semanticTokens: SemanticToken[] = [];
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
      semanticTokens.push(...getSemanticToken(binding.value));
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
      semanticTokens.push(...getSemanticToken(element))
    );
    /* istanbul ignore next */
    binding.commas?.forEach((comma) =>
      semanticTokens.push(...getSemanticToken(comma))
    );
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
      semanticTokens.push(...getSemanticToken(element))
    );
    /* istanbul ignore next */
    binding.commas?.forEach((comma) =>
      semanticTokens.push(...getSemanticToken(comma))
    );
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
  return semanticTokens;
};

const walkAttributes = (
  context: Context,
  attributes: XMLAttribute[]
): SemanticToken[] => {
  const semanticTokens: SemanticToken[] = [];
  for (const attr of attributes) {
    const ui5Node = getUI5NodeByXMLAttribute(attr, context.ui5Model);
    if (!ui5Node) {
      continue;
    }
    const value = attr.syntax.value;
    /* istanbul ignore next */
    const text = attr.value ?? "";
    const extractedText = extractBindingSyntax(text);
    for (const bindingSyntax of extractedText) {
      const { expression, startIndex } = bindingSyntax;
      if (isBindingExpression(expression)) {
        continue;
      }
      /* istanbul ignore next */
      const position: Position = {
        character: (value?.startColumn ?? 0) + startIndex,
        line: value?.startLine ? value.startLine - 1 : 0, // zero based index
      };
      const { ast, errors } = parseBinding(expression, position);
      const ui5Aggregation = getUI5AggregationByXMLAttributeKey(
        attr,
        context.ui5Model
      );
      const bindingInfo = getBindingElements(context, !!ui5Aggregation);
      const properties = bindingInfo.map((i) => i.name);

      for (const binding of ast.bindings) {
        if (!isBindingAllowed(expression, binding, errors, properties)) {
          continue;
        }
        semanticTokens.push(...getSemanticToken(binding));
      }
    }
  }
  return semanticTokens;
};

const walkElements = (
  context: Context,
  elements: XMLElement[]
): SemanticToken[] => {
  const semanticTokens: SemanticToken[] = [];
  for (const element of elements) {
    semanticTokens.push(...walkAttributes(context, element.attributes));
    if (element.subElements) {
      semanticTokens.push(...walkElements(context, element.subElements));
    }
  }
  return semanticTokens;
};
export const getSemanticTokens = async (param: {
  documentUri: string;
  content: string;
}): Promise<SemanticToken[]> => {
  const semanticTokens: SemanticToken[] = [];
  const { documentUri, content } = param;
  if (!isXMLView(documentUri)) {
    return semanticTokens;
  }
  const documentPath = URI.parse(documentUri).fsPath;
  const context = await getContext(documentPath);
  if (!isContext(context)) {
    return semanticTokens;
  }

  const { cst, tokenVector } = parse(content);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  if (!ast.rootElement) {
    return semanticTokens;
  }
  return walkElements(context, ast.rootElement.subElements);
};
