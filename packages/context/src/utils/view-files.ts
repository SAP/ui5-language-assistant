import { readdir, readFile } from "fs/promises";
import { statSync } from "fs";
import { join } from "path";
import { isXMLView } from "@ui5-language-assistant/logic-utils";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLDocument } from "@xml-tools/ast";
import { cache } from "../cache";

export async function createDocumentAst(
  documentPath: string,
  content?: string
): Promise<XMLDocument> {
  if (!content) {
    content = await readFile(documentPath, "utf-8");
  }
  const { cst, tokenVector } = parse(content);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  return ast;
}

/**
 * Get `.view.xml` or `.fragment.xml` files under webapp folder.
 *
 * @param base base path to a folder or a file
 * @param files xml files with its XMLDocument
 */
async function processViewFiles(
  base: string,
  files: Record<string, XMLDocument>
): Promise<void> {
  const fileOrFolder = await readdir(base);
  for (const item of fileOrFolder) {
    const itemPath = join(base, item);
    if (statSync(itemPath).isDirectory()) {
      await processViewFiles(itemPath, files);
    } else if (isXMLView(itemPath)) {
      const ast = await createDocumentAst(itemPath);
      files[itemPath] = ast;
    }
  }
}

/**
 * Get `.view.xml` or `.fragment.xml` files under webapp folder.
 *
 * @param manifestPath - path to manifest.json file
 * @param documentPath - path to xml view file
 * @param content document content. If provided, it will re-parse and re-assign it to current document of xml views
 * @returns xml view files
 */
export async function getViewFiles(param: {
  manifestPath: string;
  documentPath: string;
  content?: string;
}): Promise<Record<string, XMLDocument>> {
  const { manifestPath, documentPath, content } = param;
  if (Object.keys(cache.getViewFiles(manifestPath)).length > 0) {
    if (content) {
      // rebuild XMLDocument and assign it to viewFiles to avoid any cache issue
      await cache.setViewFile({
        manifestPath,
        documentPath,
        operation: "create",
        content,
      });
    }
    const viewFiles = cache.getViewFiles(manifestPath);
    return viewFiles;
  }

  const files = {};
  await processViewFiles(join(manifestPath, ".."), files);
  cache.setViewFiles(manifestPath, files);
  return files;
}
