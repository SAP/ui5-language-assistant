import axios from "axios";
import fs from "fs/promises";
import { join } from "path";
import prettier from "prettier";
import { SCHEMA_URI_WITH_PLACEHOLDER } from "../../src/constants";
import { replaceVersionPlaceholder } from "../../src/utils";

const BASE_PATH = join(process.cwd(), "src", "manifest");
const ADAPTIVE_CARD_LOCATION = join(BASE_PATH, "adaptive-card.json");
const ADAPTIVE_CARD_URI = "https://adaptivecards.io/schemas/adaptive-card.json";

// eslint-disable-next-line no-console
updateManifestResources().catch(console.error);

async function updateManifestResources() {
  await cleanManifestJsonFiles();
  await updateManifestSchema();
  await updateAdaptiveCard();
}
/**
 * Removes all JSON files from the BASE_PATH directory before updating manifest resources.
 * This ensures a clean state by deleting any existing JSON files that may be outdated.
 *
 * @returns {Promise<void>} A promise that resolves when all JSON files have been deleted
 * @throws {Error} If there's an error reading the directory or deleting files
 */
async function cleanManifestJsonFiles() {
  const files = await fs.readdir(BASE_PATH);
  for (const file of files) {
    if (file.endsWith(".json")) {
      await fs.unlink(join(BASE_PATH, file));
    }
  }
}

/**
 * Retrieves the latest version numbers of the @ui5/manifest package from npm registry.
 * Fetches distribution tags and filters for those starting with "latest" to get all
 * available latest versions.
 *
 * @returns {Promise<string[]>} A promise that resolves to an array of version strings
 * @throws {Error} If the npm registry request fails or returns invalid data
 */
async function getManifestLatestVersions() {
  const response = await axios.get(
    "https://registry.npmjs.org/-/package/@ui5/manifest/dist-tags",
    {
      responseType: "json",
    }
  );
  const versions: string[] = [];
  const distTags = response.data as Record<string, string>;
  // find key start with latest
  for (const key of Object.keys(distTags)) {
    if (key.startsWith("latest")) {
      versions.push(distTags[key]);
    }
  }
  return versions;
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
 * Fetch data from SCHEMA_URI and updates the schema.json
 */
async function updateManifestSchema() {
  const versions = await getManifestLatestVersions();
  for (const version of versions) {
    const SCHEMA_URI = replaceVersionPlaceholder(
      SCHEMA_URI_WITH_PLACEHOLDER,
      version
    );
    const content = await axiosGetRequest(SCHEMA_URI);
    const finalString = content.replace(
      /"(https:\/\/adaptivecards\.io[^"]*)"/,
      `"/manifest/adaptive-card.json"`
    );
    const prettifiedContent = prettifyFileContent(SCHEMA_URI, finalString);
    await fs.writeFile(
      join(BASE_PATH, `schema-v${version}.json`),
      prettifiedContent,
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
