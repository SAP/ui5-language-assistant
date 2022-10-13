import type { generateFunc, TestModelVersion } from "../../api";
import type {
  AppContext,
  UI5Framework,
} from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "./semantic-model-provider";

export async function getContextForFile(opts: {
  framework: UI5Framework;
  version: TestModelVersion;
  downloadLibs?: boolean;
  strict?: boolean;
  modelGenerator: generateFunc;
}): Promise<AppContext> {
  const { framework, version, modelGenerator, downloadLibs, strict } = opts;
  const ui5Model = await generateModel({
    framework,
    version,
    modelGenerator,
    downloadLibs,
    strict,
  });

  return { ui5Model };
}
