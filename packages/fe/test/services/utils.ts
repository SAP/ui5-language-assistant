import { AnnotationIssue, getCompletionItems } from "../../src/api";
import { CompletionItem } from "vscode-languageserver-types";
import { TestFramework } from "@ui5-language-assistant/test-framework";
import { getContext, isContext } from "@ui5-language-assistant/context";
import type { Context } from "@ui5-language-assistant/context";
import {
  UI5XMLViewIssue,
  validateXMLView,
} from "@ui5-language-assistant/xml-views-validation";

import { CURSOR_ANCHOR } from "@ui5-language-assistant/test-framework";
import { XMLAttribute } from "@xml-tools/ast";
import { Settings } from "@ui5-language-assistant/settings";

export const completionItemToSnapshot = (item: CompletionItem): string =>
  `label: ${item.label}; text: ${item.insertText}; kind:${
    item.kind
  }; commit:${item.commitCharacters?.toString()}; sort:${
    item.sortText ? item.sortText[0] : ""
  }`;

export const issueToSnapshot = (
  item: AnnotationIssue | UI5XMLViewIssue
): string =>
  `kind: ${item.kind}; text: ${item.message}; severity:${item.severity}; offset:${item.offsetRange.start}-${item.offsetRange.end}`;

export type ViewCompletionProviderType = (
  snippet: string,
  that: { timeout: (t: number) => void },
  contextAdapter?: (context: Context) => Context
) => Promise<CompletionItem[]>;

export const getViewCompletionProvider = (
  framework: TestFramework,
  viewFilePathSegments: string[],
  documentPath: string,
  uri: string,
  settings: Settings
): ViewCompletionProviderType => async (
  snippet: string,
  that: { timeout: (t: number) => void },
  contextAdapter?: (context: Context) => Context
): Promise<CompletionItem[]> => {
  const timeout = 60000;
  that.timeout(timeout);
  let result: CompletionItem[] = [];
  try {
    const { offset } = await framework.updateFileContent(
      viewFilePathSegments,
      snippet,
      { insertAfter: "<content>" }
    );
    const { ast, cst, tokenVector, content } = await framework.readFile(
      viewFilePathSegments
    );
    const { document, textDocumentPosition } = framework.toVscodeTextDocument(
      uri,
      content,
      offset
    );
    const context = await getContext(documentPath);
    if (isContext(context)) {
      result = getCompletionItems({
        ast,
        context: contextAdapter ? contextAdapter(context) : context,
        cst,
        document,
        documentSettings: settings,
        textDocumentPosition,
        tokenVector,
      });
    }
  } finally {
    // reversal update
    await framework.updateFileContent(viewFilePathSegments, "", {
      doUpdatesAfter: "<content>",
      replaceText: snippet.replace(CURSOR_ANCHOR, ""),
    });
  }
  return result;
};

type AttributeValidator = (
  attribute: XMLAttribute,
  context: Context
) => AnnotationIssue[];

export type ViewValidatorType = (
  snippet: string,
  that: { timeout: (t: number) => void },
  contextAdapter?: (context: Context) => Context
) => Promise<AnnotationIssue[]>;

export const getViewValidator = (
  framework: TestFramework,
  viewFilePathSegments: string[],
  documentPath: string,
  validator: AttributeValidator
): ViewValidatorType => async (
  snippet: string,
  that: { timeout: (t: number) => void },
  contextAdapter?: (context: Context) => Context
): Promise<AnnotationIssue[]> => {
  const timeout = 60000;
  that.timeout(timeout);
  let result: AnnotationIssue[] = [];
  try {
    await framework.updateFileContent(viewFilePathSegments, snippet, {
      insertAfter: "<content>",
    });
    const { ast } = await framework.readFile(viewFilePathSegments);
    const context = await getContext(documentPath);
    if (isContext(context)) {
      result = validateXMLView({
        validators: {
          attribute: [validator],
          document: [],
          element: [],
        },
        context: contextAdapter ? contextAdapter(context) : context,
        xmlView: ast,
      });
    }
  } finally {
    // reversal update
    await framework.updateFileContent(viewFilePathSegments, "", {
      doUpdatesAfter: "<content>",
      replaceText: snippet.replace(CURSOR_ANCHOR, ""),
    });
  }
  return result;
};
