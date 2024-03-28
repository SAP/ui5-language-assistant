import { Location, Position } from "vscode-languageserver-types";
import { DefinitionParams } from "vscode-languageserver";
import { readFile } from "fs/promises";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { buildFileUri, getAttribute } from "../utils";
import { URI } from "vscode-uri";
import { isContext, getContext } from "@ui5-language-assistant/context";
import {
  parseBinding,
  positionInside,
} from "@ui5-language-assistant/binding-parser";

const allowedAttrs = new Set([
  "controllerName",
  "template:require",
  "core:require",
]);
const exts = [".controller.js", ".js", ".controller.ts", ".ts"];

/**
 * Get controller location.
 * It searches local file system for file with `.controller.js`, `.js`, `.controller.ts` or `.ts` extension.
 *
 * @param param definition param
 * @returns array of location
 */
export async function getControllerLocation(
  param: DefinitionParams
): Promise<Location[]> {
  const { position, textDocument } = param;
  const documentUri = textDocument.uri;
  const documentPath = URI.parse(documentUri).fsPath;
  const text = await readFile(documentPath, "utf-8");
  const { cst, tokenVector } = parse(text);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  if (!ast.rootElement) {
    return [];
  }
  const attr = getAttribute(ast.rootElement, position, allowedAttrs);
  if (!attr) {
    return [];
  }

  const context = await getContext(documentPath);
  if (!isContext(context)) {
    return [];
  }
  // value must be present - otherwise getAttribute method returns undefined
  const value = attr.value as string;
  const id = context.manifestDetails.appId;
  const manifestPath = context.manifestDetails.manifestPath;

  if (value.indexOf("/") !== -1) {
    // handle object notation
    /* istanbul ignore next */
    const character = attr.syntax.value?.startColumn ?? 0;
    /* istanbul ignore next */
    const line = (attr.syntax.value && attr.syntax.value.startLine - 1) ?? 0; // zero based index
    const pos: Position = { character, line };
    const result = parseBinding(value, pos);
    /* istanbul ignore next */
    const el = result.ast.bindings[0]?.elements.find((i) =>
      /* istanbul ignore next */
      positionInside(i.value?.range, position)
    );
    if (!el) {
      return [];
    }
    /* istanbul ignore next */
    if (el.value?.type !== "string-value") {
      return [];
    }
    const text = el.value.text.split("/").join(".").replace(/'|"$/g, "");

    const fileUri = await buildFileUri(id, text, manifestPath, exts);
    if (!fileUri) {
      return [];
    }
    return [
      {
        uri: fileUri,
        range: { start: position, end: position },
      },
    ];
  }

  // handle dot notation
  const fileUri = await buildFileUri(id, value, manifestPath, exts);
  if (!fileUri) {
    return [];
  }
  return [
    {
      uri: fileUri,
      range: { start: position, end: position },
    },
  ];
}
