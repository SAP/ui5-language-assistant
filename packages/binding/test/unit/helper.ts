import { BindingIssue, getCompletionItems } from "../../src/api";
import {
  CompletionItem,
  MarkupContent,
  Range,
  TextEdit,
} from "vscode-languageserver-types";
import { TestFramework } from "@ui5-language-assistant/test-framework";
import { getContext } from "@ui5-language-assistant/context";
import type { Context } from "@ui5-language-assistant/context";
import { validateXMLView } from "@ui5-language-assistant/xml-views-validation";

import { CURSOR_ANCHOR } from "@ui5-language-assistant/test-framework";
import { XMLAttribute } from "@xml-tools/ast";
import { Settings } from "@ui5-language-assistant/settings";

const doc = (doc: MarkupContent | string | undefined): string => {
  if (!doc) {
    return "";
  }
  if (typeof doc === "string") {
    return doc;
  }
  return `kind:${doc.kind},value:${doc.value}`;
};
const createRange = (range: Range): string => {
  return `${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`;
};

export const completionItemToSnapshot = (
  item: CompletionItem,
  documentation = false
): string => {
  const textEdit = item.textEdit as TextEdit;
  return `label: ${item.label}; text: ${item.insertText}; kind:${
    item.kind
  }; commit:${item.commitCharacters?.toString()}; sort:${
    item.sortText ? item.sortText[0] : ""
  }${`${documentation ? `; documentation: ${doc(item.documentation)}` : ""}`}${
    textEdit
      ? `; textEdit: {newText: ${textEdit.newText}, range: ${createRange(
          textEdit.range
        )}}`
      : ""
  }`;
};

export const issueToSnapshot = (item: BindingIssue): string =>
  `kind: ${item.kind}; text: ${item.message}; severity:${
    item.severity
  }; range:${createRange(item.range)}`;

export type ViewCompletionProviderType = (
  snippet: string,
  contextAdapter?: (context: Context) => Context
) => Promise<CompletionItem[]>;

export const getViewCompletionProvider =
  (
    framework: TestFramework,
    viewFilePathSegments: string[],
    documentPath: string,
    uri: string,
    settings: Settings
  ): ViewCompletionProviderType =>
  async (
    snippet: string,
    contextAdapter?: (context: Context) => Context
  ): Promise<CompletionItem[]> => {
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
      const context = (await getContext(documentPath)) as Context;

      result = getCompletionItems({
        ast,
        context: contextAdapter ? contextAdapter(context) : context,
        cst,
        document,
        documentSettings: settings,
        textDocumentPosition,
        tokenVector,
      });
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
) => BindingIssue[];

export type ViewValidatorType = (
  snippet: string,
  that: { timeout: (t: number) => void },
  contextAdapter?: (context: Context) => Context
) => Promise<BindingIssue[]>;

export const getViewValidator =
  (
    framework: TestFramework,
    viewFilePathSegments: string[],
    documentPath: string,
    validator: AttributeValidator
  ): ViewValidatorType =>
  async (
    snippet: string,
    that: { timeout: (t: number) => void },
    contextAdapter?: (context: Context) => Context
  ): Promise<BindingIssue[]> => {
    const timeout = 60000;
    that.timeout(timeout);
    let result: BindingIssue[] = [];
    try {
      await framework.updateFileContent(viewFilePathSegments, snippet, {
        insertAfter: "<content>",
      });
      const { ast } = await framework.readFile(viewFilePathSegments);
      const context = (await getContext(documentPath)) as Context;
      result = validateXMLView({
        validators: {
          attribute: [validator],
          document: [],
          element: [],
        },
        context: contextAdapter ? contextAdapter(context) : context,
        xmlView: ast,
      }) as BindingIssue[];
    } finally {
      // reversal update
      await framework.updateFileContent(viewFilePathSegments, "", {
        doUpdatesAfter: "<content>",
        replaceText: snippet.replace(CURSOR_ANCHOR, ""),
      });
    }
    return result;
  };

export const prepareContextAdapter: (
  contextPath: string | undefined
) => (context: Context) => Context = (contextPath) => (c) => {
  const customViewKey = Object.keys(c.manifestDetails.customViews)[0];
  return {
    ...c,
    manifestDetails: {
      ...c.manifestDetails,
      customViews: {
        [customViewKey]: {
          ...c.manifestDetails.customViews[customViewKey],
          contextPath,
        },
      },
    },
  };
};
