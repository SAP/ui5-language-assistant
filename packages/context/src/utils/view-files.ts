import { readdir, readFile } from "fs/promises";
import { statSync } from "fs";
import { join } from "path";
import { isXMLView } from "@ui5-language-assistant/logic-utils";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLDocument } from "@xml-tools/ast";
import { cache } from "../cache";
import type { DocPath } from "../types";

/**
 * Get `.view.xml` or `.fragment.xml` files under webapp folder.
 *
 * @param base base path to a folder or a file
 * @param files xml files with its XMLDocument
 * @returns xml files with its XMLDocument
 */
async function processViewFiles(
  base: string,
  files: Record<string, XMLDocument> = {}
): Promise<Record<DocPath, XMLDocument>> {
  return new Promise((resolve) => {
    return readdir(base).then(async (fileOrFolder) => {
      for (const item of fileOrFolder) {
        const itemPath = join(base, item);
        if (statSync(itemPath).isDirectory()) {
          await processViewFiles(itemPath, files);
        } else {
          if (isXMLView(itemPath)) {
            const content = await readFile(itemPath, "utf-8");
            const { cst, tokenVector } = parse(content);
            const ast = buildAst(cst as DocumentCstNode, tokenVector);
            files[itemPath] = ast;
          }
        }
      }
      return resolve(files);
    });
  });
}

/**
 * Get `.view.xml` or `.fragment.xml` files under webapp folder.
 *
 * @param webappPath web app path
 * @returns xml files with its XMLDocument
 * @description it caches XMLDocument
 */
export async function getViewFiles(
  webappPath: string
): Promise<Record<DocPath, XMLDocument>> {
  let files = cache.getViewFiles(webappPath);
  if (Object.keys(files).length > 0) {
    return files;
  }
  files = await processViewFiles(webappPath);
  cache.setViewFiles(webappPath, files);
  return files;
}
