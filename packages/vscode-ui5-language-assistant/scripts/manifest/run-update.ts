import axios from "axios";
import fs from "fs/promises";
import { join } from "path";
import prettier from "prettier";

export const BASE_PATH = join(process.cwd(), "src", "manifest");
export const MANIFEST_SCHEMA_LOCATION = join(BASE_PATH, "schema.json");
export const ADAPTIVE_CARD_LOCATION = join(BASE_PATH, "adaptive-card.json");
export const MANIFEST_SCHEMA_URI =
  "https://raw.githubusercontent.com/SAP/ui5-manifest/master/schema.json";
export const ADAPTIVE_CARD_URI =
  "http://adaptivecards.io/schemas/adaptive-card.json";

// eslint-disable-next-line no-console
updateManifestResources().catch(console.error);

async function updateManifestResources() {
  await updateManifestSchama();
  await updateAdaptiveCard();
}

/**
 * Fetch data from ADAPTIVE_CARD_URI and updates the adaptive-card.json
 */
async function updateAdaptiveCard() {
  const content = await axiosGetRequest(ADAPTIVE_CARD_URI);
  const prettifiedContent = prettifyFileContent(ADAPTIVE_CARD_URI, content);
  if (prettifiedContent) {
    await fs.writeFile(ADAPTIVE_CARD_LOCATION, prettifiedContent, "utf8");
  }
}

/**
 * Fetch data from MANIFEST_SCHEMA_URI and updates the schema.json
 */
async function updateManifestSchama() {
  const content = await axiosGetRequest(MANIFEST_SCHEMA_URI);
  const finalString = content.replace(
    /"(https:\/\/adaptivecards\.io[^"]*)"/,
    `"/manifest/adaptive-card.json"`
  );
  const prettifiedContent = prettifyFileContent(
    MANIFEST_SCHEMA_URI,
    finalString
  );
  if (prettifiedContent) {
    await fs.writeFile(MANIFEST_SCHEMA_LOCATION, prettifiedContent, "utf8");
  }
}

async function axiosGetRequest(uri: string): Promise<string> {
  const response = await axios.get(uri, {
    responseType: "json",
  });
  return JSON.stringify(response.data, null, 2);
}

function prettifyFileContent(filepath: string, content: string): string {
  return prettier.format(content, {
    tabWidth: 2,
    filepath,
    parser: "json",
  });
}
