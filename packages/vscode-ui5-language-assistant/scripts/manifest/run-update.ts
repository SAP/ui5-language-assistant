import axios from "axios";
import fs from "fs/promises";
import { join } from "path";
import prettier from "prettier";
import { SCHEMA_URI_V1_MAIN, SCHEMA_URI_V2_MAIN } from "../../src/constants";

export const BASE_PATH = join(process.cwd(), "src", "manifest");
export const MANIFEST_SCHEMA_LOCATION_V1 = join(BASE_PATH, "schema-v1.json");
export const MANIFEST_SCHEMA_LOCATION_V2 = join(BASE_PATH, "schema-v2.json");
export const ADAPTIVE_CARD_LOCATION = join(BASE_PATH, "adaptive-card.json");
export const ADAPTIVE_CARD_URI =
  "https://adaptivecards.io/schemas/adaptive-card.json";

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
  const contentV1 = await axiosGetRequest(SCHEMA_URI_V1_MAIN);
  const contentV2 = await axiosGetRequest(SCHEMA_URI_V2_MAIN);
  const finalStringV1 = contentV1.replace(
    /"(https:\/\/adaptivecards\.io[^"]*)"/,
    `"/manifest/adaptive-card.json"`
  );
  const finalStringV2 = contentV2.replace(
    /"(https:\/\/adaptivecards\.io[^"]*)"/,
    `"/manifest/adaptive-card.json"`
  );

  const prettifiedContentV1 = prettifyFileContent(
    SCHEMA_URI_V1_MAIN,
    finalStringV1
  );
  if (prettifiedContentV1) {
    await fs.writeFile(
      MANIFEST_SCHEMA_LOCATION_V1,
      prettifiedContentV1,
      "utf8"
    );
  }
  const prettifiedContentV2 = prettifyFileContent(
    SCHEMA_URI_V2_MAIN,
    finalStringV2
  );
  if (prettifiedContentV2) {
    await fs.writeFile(
      MANIFEST_SCHEMA_LOCATION_V2,
      prettifiedContentV2,
      "utf8"
    );
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
