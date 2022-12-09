import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  Position,
  Range,
  TextDocumentPositionParams,
  TextEdit,
} from "vscode-languageserver";
import { assertNever } from "assert-never";
import { map } from "lodash";
import { CstNode, IToken } from "chevrotain";
import { DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLToken, XMLDocument } from "@xml-tools/ast";

import { GetXMLViewCompletionsOpts } from "@ui5-language-assistant/xml-views-completion";
import { getSuggestions } from "@xml-tools/content-assist";
import { Context } from "@ui5-language-assistant/context";
import { TextDocument } from "vscode-languageserver-textdocument";
import { attributeValueProviders } from "./providers";
import { UI5XMLViewAnnotationCompletion } from "../../types";
import { Settings } from "@ui5-language-assistant/settings";

export function getCompletionItems(opts: {
  context: Context;
  textDocumentPosition: TextDocumentPositionParams;
  document: TextDocument;
  documentSettings: Settings;
  cst: CstNode;
  tokenVector: IToken[];
  ast: XMLDocument;
}): CompletionItem[] {
  const suggestions = getXMLViewCompletions({
    context: opts.context,
    offset: opts.document.offsetAt(opts.textDocumentPosition.position),
    cst: opts.cst as DocumentCstNode,
    ast: opts.ast,
    tokenVector: opts.tokenVector,
    settings: { codeAssist: opts.documentSettings.codeAssist },
  });

  const completionItems = transformToLspSuggestions(
    suggestions,
    opts.textDocumentPosition
  );

  return completionItems;
}

export function getXMLViewCompletions(
  opts: GetXMLViewCompletionsOpts
): UI5XMLViewAnnotationCompletion[] {
  const suggestions = getSuggestions<UI5XMLViewAnnotationCompletion, Context>({
    offset: opts.offset,
    cst: opts.cst,
    ast: opts.ast,
    tokenVector: opts.tokenVector,
    context: opts.context,
    providers: {
      elementContent: [],
      elementName: [],
      attributeName: [],
      attributeValue: attributeValueProviders,
    },
  });
  return suggestions;
}

function transformToLspSuggestions(
  suggestions: UI5XMLViewAnnotationCompletion[],
  textDocumentPosition: TextDocumentPositionParams
): CompletionItem[] {
  const lspSuggestions = map(suggestions, (suggestion) => {
    const lspKind = computeLSPKind(suggestion);
    const textEditDetails = createTextEdits(
      suggestion,
      textDocumentPosition.position
    );

    const item = suggestion.node;
    const completionItem: CompletionItem = {
      label: item.text,
      deprecated: item.deprecated,
      commitCharacters: item.commitCharacters,
      sortText: item.sortText,
      documentation: item.documentation,
      insertText: item.insertText || item.text,
      filterText: textEditDetails.filterText,
      textEdit: textEditDetails.textEdit,
      insertTextFormat: InsertTextFormat.Snippet,
      additionalTextEdits: textEditDetails.additionalTextEdits,
      kind: lspKind,
    };
    return completionItem;
  });
  return lspSuggestions;
}

export function computeLSPKind(
  suggestion: UI5XMLViewAnnotationCompletion
): CompletionItemKind {
  switch (suggestion.type) {
    case "AnnotationTargetInXMLAttributeValue": {
      switch (suggestion.node.kind) {
        case "EntityContainer":
          return CompletionItemKind.Folder;
        case "EntitySet":
        case "Singleton":
          return CompletionItemKind.Method;
        case "EntityType":
          return CompletionItemKind.Class;
        case "NavigationProperty":
          return CompletionItemKind.Reference;
        default:
          assertNever(suggestion.node, true);
          return CompletionItemKind.Text;
      }
    }

    case "AnnotationPathInXMLAttributeValue": {
      switch (suggestion.node.kind) {
        case "NavigationProperty":
          return CompletionItemKind.Reference;
        case "Term":
          return CompletionItemKind.Value;
        default:
          assertNever(suggestion.node, true);
          return CompletionItemKind.Text;
      }
    }

    case "PropertyPathInXMLAttributeValue":
      switch (suggestion.node.kind) {
        case "NavigationProperty":
          return CompletionItemKind.Reference;
        case "Property":
          return CompletionItemKind.Property;
        default:
          assertNever(suggestion.node, true);
          return CompletionItemKind.Text;
      }

    case "FilterBarIdInXMLAttributeValue":
      return CompletionItemKind.EnumMember;

    default:
      assertNever(suggestion, true);
      return CompletionItemKind.Text;
  }
}

function createTextEdits(
  suggestion: UI5XMLViewAnnotationCompletion,
  originalPosition: Position
): { textEdit: TextEdit; filterText: string; additionalTextEdits: TextEdit[] } {
  const additionalTextEdits: TextEdit[] = [];
  let range: Range = {
    start: originalPosition,
    end: originalPosition,
  };

  // The filter text is used by VSCode/Theia to filter out suggestions that don't match the text the user wrote.
  // Every character being replaced by the TextEdit (until the cursor position) should exist in the filter text.
  // Since we replace the whole value (tag name/attribute key/attribute value) the filter text should contain
  // the entire prefix (including the xml namespace in tag name, surrounding quotation marks for attribute value etc).
  // In simple cases (like property name) this will be the name of the UI5 node.
  const filterText = suggestion.node.filterText || suggestion.node.text;
  const newText = suggestion.node.insertText || suggestion.node.text;
  switch (suggestion.type) {
    // Attribute key
    case "AnnotationPathInXMLAttributeValue":
    case "PropertyPathInXMLAttributeValue":
    case "AnnotationTargetInXMLAttributeValue": {
      /* istanbul ignore next */
      range = suggestion.node.affectedRange ?? range;
      break;
    }

    case "FilterBarIdInXMLAttributeValue": {
      /* istanbul ignore next */
      // else case is not reproducible
      range = suggestion.node.affectedRange ?? range;
      break;
    }

    /* istanbul ignore next */
    default:
      assertNever(suggestion, true);
  }

  return {
    textEdit: {
      range,
      newText,
    },
    filterText,
    additionalTextEdits,
  };
}

// export interface CompleteString {
//   startString: string;
//   remainingString: string;
//   position: Position;
// }

// export function getAffectedRange(commitCharacters, completeString: CompleteString): Range {
//   let startStringLength = completeString.position.character - completeString.startString.length;
//   let remainingStringLength = completeString.position.character + completeString.remainingString.length;

//   const commitCharacter = commitCharacters && commitCharacters.length ? commitCharacters[0] : '';

//   // limit to the left with commitCharacter or '/'
//   const fragmentArray = completeString.startString.split(commitCharacter || '/');
//   if (fragmentArray.length > 1) {
//       const newString = fragmentArray.pop();
//       startStringLength = completeString.position.character - newString!.toString().length;
//   }

//   // limit to the right only if commitCharacter is present
//   if (commitCharacter) {
//       const remainingStringFragment = completeString.remainingString.split(commitCharacter);
//       if (remainingStringFragment.length > 1) {
//           const newString = remainingStringFragment.slice(0, 1);
//           remainingStringLength = completeString.position.character + newString.toString().length;
//       }
//   }

//   // Return affected range: Range
//   return {
//       start: {
//           line: completeString.position.line,
//           character: startStringLength
//       },
//       end: {
//           line: completeString.position.line,
//           character: remainingStringLength
//       }
//   };
// }

// Calculates completion range based on attribute position information considering that value region includes quotes
export function getAffectedRange(
  token?: XMLToken,
  offset = 0
): Range | undefined {
  if (!token) {
    return;
  }
  const completionSegmentStart = token.startColumn + offset;
  const completionSegmentEnd = token.endColumn - 1;
  const line = token.startLine - 1;
  return {
    start: { line, character: completionSegmentStart },
    end: { line, character: completionSegmentEnd },
  };
}
