import { parse, merge } from "@sap-ux/edmx-parser";
import { convert } from "@sap-ux/annotation-converter";
import { ServiceDetails, ServiceFiles } from "./types";
import type { RawMetadata } from "@sap-ux/vocabularies-types";
import { getLogger } from "./utils";
/**
 * Parser service files like metadata content and annotation files
 */
export function parseServiceFiles({
  metadataContent,
  annotationFiles,
  path,
}: ServiceFiles): ServiceDetails | undefined {
  if (!metadataContent) {
    return undefined;
  }
  const metadata = parse(metadataContent, "metadata");
  const annotations: RawMetadata[] = [];

  for (let i = 0; i < annotationFiles.length; i++) {
    try {
      const parsedAnnotation = parse(
        annotationFiles[i],
        `annotationFile${i + 1}`
      );
      annotations.push(parsedAnnotation);
    } catch (error: unknown) {
      // log and continue
      getLogger().warn(
        `parseServiceFiles: Failed to parse annotation file ${
          i + 1
        } at path ${path}: ${error}`
      );
    }
  }

  const mergedModel = merge(metadata, ...annotations);

  const convertedMetadata = convert(mergedModel);

  const service: ServiceDetails = {
    path,
    convertedMetadata,
  };

  return service;
}
