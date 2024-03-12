import axios from "axios";
import fs from "fs/promises";
import { join } from "path";

export const MANIFEST_SCHEMA_LOCATION = join("src", "manifest", "schema.json");
export const MANIFEST_SCHEMA_URI =
  "https://raw.githubusercontent.com/SAP/ui5-manifest/master/schema.json";

/* eslint-disable no-console */ // Only intend to run in CLI environment where we don't need more advanced logging
updateManifestSchama().catch(console.error);

/**
 * Reads the content from the url and updates the schema.json file.
 * @public
 * @returns - Returns schema content
 */
export async function updateManifestSchama() {
  let schemaContent = await getSchama();
  schemaContent = JSON.stringify(schemaContent, null, 2);
  await fs.writeFile(MANIFEST_SCHEMA_LOCATION, schemaContent, "utf8");
}

async function getSchama(): Promise<any> {
  const response = await axios.get<any>(MANIFEST_SCHEMA_URI, {
    responseType: "json",
  });
  return response.data;
}
