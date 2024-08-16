import { cache } from "../api";
import { ControlIdLocation, DocumentPath } from "../types";
import { IdsCollectorVisitor } from "./ids-collector";
import { accept } from "@xml-tools/ast";

/**
 * Process control ids
 *
 * @param param parameter object
 * @param param.manifestPath path to manifest.json file
 * @param param.documentPath path to xml view file
 */
function processControlIds(param: {
  manifestPath: string;
  documentPath: DocumentPath;
}): void {
  const { documentPath, manifestPath } = param;
  // check cache
  if (Object.keys(cache.getControlIds(manifestPath)).length > 0) {
    // for current document, re-collect and re-assign it to avoid cache issue
    cache.setControlIdsForViewFile({
      manifestPath,
      documentPath,
      operation: "create",
    });
    return;
  }

  // build fresh
  const ctrIds: Record<DocumentPath, Map<string, ControlIdLocation[]>> = {};
  const viewFiles = cache.getViewFiles(manifestPath);
  const files = Object.keys(viewFiles);
  for (const docPath of files) {
    const idCollector = new IdsCollectorVisitor(docPath);
    accept(viewFiles[docPath], idCollector);
    ctrIds[docPath] = idCollector.getControlIds();
  }
  cache.setControlIds(manifestPath, ctrIds);
}

/**
 * Get control ids of all xml files.
 *
 * @param param parameter object
 * @param param.manifestPath path to manifest.json file
 * @param param.documentPath path to xml view file
 * @returns merged control ids of all xml files
 */
export function getControlIds(param: {
  manifestPath: string;
  documentPath: DocumentPath;
}): Map<string, ControlIdLocation[]> {
  const { manifestPath } = param;

  processControlIds(param);

  const allDocumentsIds = cache.getControlIds(manifestPath);
  const keys = Object.keys(allDocumentsIds);

  const mergedIds: Map<string, ControlIdLocation[]> = new Map();
  for (const doc of keys) {
    const ids = allDocumentsIds[doc];
    for (const [id, location] of ids) {
      const existing = mergedIds.get(id);
      if (existing) {
        mergedIds.set(id, [...existing, ...location]);
      } else {
        mergedIds.set(id, location);
      }
    }
  }
  return mergedIds;
}
