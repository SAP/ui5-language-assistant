import { AnnotationIssue } from "../../src/api";
import { CompletionItem } from "vscode-languageserver-types";

export const completionItemToSnapshot = (item: CompletionItem): string =>
  `label: ${item.label}; text: ${item.insertText}; kind:${
    item.kind
  }; commit:${item.commitCharacters?.toString()}; sort:${
    item.sortText ? item.sortText[0] : ""
  }`;

export const issueToSnapshot = (item: AnnotationIssue): string =>
  `kind: ${item.kind}; text: ${item.message}; severity:${item.severity}; offset:${item.offsetRange.start}-${item.offsetRange.end}`;
