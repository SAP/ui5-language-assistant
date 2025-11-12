import { parse, merge } from "@sap-ux/edmx-parser";
import { convert } from "@sap-ux/annotation-converter";
import { ServiceDetails, ServiceFiles } from "./types";

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
  const annotations = annotationFiles.map((file, i) =>
    parse(file, `annotationFile${i}`)
  );
  const mergedModel = merge(metadata, ...annotations);

  const convertedMetadata = convert(mergedModel);

  const service: ServiceDetails = {
    path,
    convertedMetadata,
  };

  return service;
}
