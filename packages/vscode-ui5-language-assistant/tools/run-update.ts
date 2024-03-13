import axios from "axios";
import fs from "fs/promises";
import { join } from "path";
import prettier from "prettier";

export const BASE_PATH = join("src", "manifest");
export const MANIFEST_SCHEMA_LOCATION = join(BASE_PATH, "schema.json");
export const ADAPTIVE_CARD_LOCATION = join(BASE_PATH, "adaptive-card.json");
export const MANIFEST_SCHEMA_URI =
  "https://raw.githubusercontent.com/SAP/ui5-manifest/master/schema.json";
export const ADAPTIVE_CARD_URI =
  "http://adaptivecards.io/schemas/adaptive-card.json";

/* eslint-disable no-console */ // Only intend to run in CLI environment where we don't need more advanced logging
updateManifestResources().catch(console.error);

async function updateManifestResources() {
  await updateManifestSchama();
  await updateAdaptiveCard();
}

/**
 * Fetch data from ADAPTIVE_CARD_URI and updates the adaptive-card.json
 */
async function updateAdaptiveCard() {
  let adaptiveCardContent = await axiosGetRequest(ADAPTIVE_CARD_URI);
  const prettifiedContent = prettifyFileContent(
    ADAPTIVE_CARD_URI,
    JSON.stringify(adaptiveCardContent, null, 2)
  );
  if (prettifiedContent) {
    await fs.writeFile(ADAPTIVE_CARD_LOCATION, prettifiedContent, "utf8");
  }
}

/**
 * Fetch data from MANIFEST_SCHEMA_URI and updates the schema.json
 */
async function updateManifestSchama() {
  const schemaContent = await axiosGetRequest(MANIFEST_SCHEMA_URI);
  const prettifiedContent = prettifyFileContent(
    MANIFEST_SCHEMA_URI,
    JSON.stringify(schemaContent, null, 2)
  );
  const finalString = prettifiedContent.replace(
    /"(https:\/\/adaptivecards\.io[^"]*)"/,
    `"/manifest/adaptive-card.json"`
  );
  if (finalString) {
    await fs.writeFile(MANIFEST_SCHEMA_LOCATION, finalString, "utf8");
  }
}

async function axiosGetRequest(uri: string): Promise<any> {
  const response = await axios.get<any>(uri, {
    responseType: "json",
  });
  return response.data;
}

function prettifyFileContent(filepath: string, content: string): string {
  return prettier.format(content, {
    tabWidth: 2,
    filepath,
    parser: "json",
  });
}
