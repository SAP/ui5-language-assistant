import { noop } from "lodash";
import fetch from "node-fetch";

// Disable this flag if you want/need spam/info in the tests logs.
const silent = false;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const log = silent ? noop : (_: string) => console.log(_);
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const error = silent ? noop : (_: string) => console.error(_);

export async function fetchDistMetadata(
  version: string
): Promise<UI5DistMetadata> {
  const sapUI5Response = await fetch(
    `https://unpkg.com/@sapui5/distribution-metadata@${version}/metadata.json`
  );
  if (!sapUI5Response.ok) {
    log(`error fetching sapui5 metadata`);
    return [];
  }
  const sapUI5MetadataText = await sapUI5Response.text();
  const sapUI5Metadata = JSON.parse(sapUI5MetadataText);
  return sapUI5Metadata;
}
