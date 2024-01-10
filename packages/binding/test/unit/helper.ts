import { BindingIssue, getCompletionItems, getHover } from "../../src/api";
import {
  CompletionItem,
  Hover,
  MarkupContent,
  Range,
  TextEdit,
} from "vscode-languageserver-types";
import { TestFramework } from "@ui5-language-assistant/test-framework";
import { getContext } from "@ui5-language-assistant/context";
import type { Context } from "@ui5-language-assistant/context";
import { validateXMLView } from "@ui5-language-assistant/xml-views-validation";
import { astPositionAtOffset } from "@xml-tools/ast-position";
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
const createRange = (range: Range | undefined): string => {
  if (range) {
    return `${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`;
  }
  return "0:0-0:0";
};

export const removeUI5PatchVersion = (
  completionItems: CompletionItem[]
): void => {
  for (const item of completionItems) {
    if (item.documentation) {
      if (typeof item.documentation === "string") {
        const value = item.documentation.replace(/\.(\d+)\//, "");
        item.documentation = value;
      } else if (item.documentation.kind === "markdown") {
        const value = item.documentation.value.replace(/\.(\d+)\//, "");
        item.documentation.value = value;
      }
    }
  }
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

const getContent = (snippet: string): string => {
  return `<mvc:View xmlns:core="sap.ui.core"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns:f="sap.f"
    xmlns="sap.m"
    xmlns:l="sap.ui.layout"
    xmlns:macros="sap.fe.macros"
    xmlns:html="http://www.w3.org/1999/xhtml" controllerName="sap.fe.demo.managetravels.ext.main.Main">
    <Page id="Main" title="Main">
        <content>${snippet}
        </content>
    </Page>
</mvc:View>
    `;
};
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
    const { offset } = await framework.updateFile(
      viewFilePathSegments,
      getContent(snippet)
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

    const result = await getCompletionItems({
      ast,
      context: contextAdapter ? contextAdapter(context) : context,
      cst,
      document,
      documentSettings: settings,
      textDocumentPosition,
      tokenVector,
    });
    removeUI5PatchVersion(result);
    return result;
  };

type AttributeValidator = (
  attribute: XMLAttribute,
  context: Context
) => BindingIssue[];

export type ViewValidatorType = (
  snippet: string,
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
    contextAdapter?: (context: Context) => Context
  ): Promise<BindingIssue[]> => {
    await framework.updateFile(viewFilePathSegments, getContent(snippet));
    const { ast } = await framework.readFile(viewFilePathSegments);
    const context = (await getContext(documentPath)) as Context;
    return validateXMLView({
      validators: {
        attribute: [validator],
        document: [],
        element: [],
      },
      context: contextAdapter ? contextAdapter(context) : context,
      xmlView: ast,
    }) as BindingIssue[];
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

export type HoverService = (
  snippet: string,
  removePropertyBindingInfo?: boolean,
  emptyContext?: boolean
) => Promise<Hover | undefined>;
export const getHoverService =
  (
    framework: TestFramework,
    viewFilePathSegments: string[],
    documentPath: string,
    uri: string
  ): HoverService =>
  async (
    snippet: string,
    removePropertyBindingInfo = false,
    emptyContext = false
  ): Promise<Hover | undefined> => {
    const { offset } = await framework.updateFile(
      viewFilePathSegments,
      getContent(snippet)
    );
    const { ast, content } = await framework.readFile(viewFilePathSegments);
    const { textDocumentPosition } = framework.toVscodeTextDocument(
      uri,
      content,
      offset
    );
    let hoverContext;
    if (emptyContext) {
      hoverContext = {};
    } else {
      const context = (await getContext(documentPath)) as Context;
      hoverContext = { ...context, textDocumentPosition };
      if (removePropertyBindingInfo) {
        hoverContext = {
          ...context,
          textDocumentPosition,
          ui5Model: {
            ...context.ui5Model,
            typedefs: {
              ...context.ui5Model.typedefs,
              "sap.ui.base.ManagedObject.PropertyBindingInfo":
                undefined as unknown,
            },
          },
        };
      }
    }

    const astPosition = astPositionAtOffset(ast, offset);
    if (!astPosition) {
      return;
    }
    if (astPosition.kind !== "XMLAttributeValue") {
      return;
    }
    return getHover(hoverContext, astPosition.astNode);
  };
