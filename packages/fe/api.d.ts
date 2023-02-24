import type {
  BaseUI5XMLViewIssue,
  UI5ValidatorsConfig,
} from "@ui5-language-assistant/xml-views-validation";
import type { Context } from "@ui5-language-assistant/context";
import type {
  TextDocumentPositionParams,
  CompletionItem,
} from "vscode-languageserver-protocol";
import type { CstNode, IToken } from "chevrotain";
import type { XMLDocument } from "@xml-tools/ast";
import type { TextDocument } from "vscode-languageserver-textdocument";
import type { Settings } from "@ui5-language-assistant/settings";
import type { AnnotationIssue } from "./src/types/issues";

export type { AnnotationIssue } from "./src/types/issues";

export declare const defaultValidators: UI5ValidatorsConfig<AnnotationIssue>;

export function getCompletionItems(opts: {
  context: Context;
  textDocumentPosition: TextDocumentPositionParams;
  document: TextDocument;
  documentSettings: Settings;
  cst: CstNode;
  tokenVector: IToken[];
  ast: XMLDocument;
}): CompletionItem[];

export function isAnnotationIssue<T extends BaseUI5XMLViewIssue>(
  issue: AnnotationIssue | T
): issue is AnnotationIssue;

export function initI18n(i18nInstance: i18n): void;
// test change 4
