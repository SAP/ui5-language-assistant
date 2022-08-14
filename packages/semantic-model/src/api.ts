import {
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";
import { TypeNameFix, Json } from "../api";
import { ConcreteSymbol } from "./api-json";
import { convertToSemanticModel } from "./convert";
import { resolveSemanticProperties } from "./resolve";
import { generateMissingSymbols } from "./enhance";
import { newMap } from "./utils";
import deepFreezeStrict from "deep-freeze-strict";

// ESLint will remove the ":string" causing an error in "implementation-matches-public-api.ts"
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const GENERATED_LIBRARY: string = "Generated";

// See comment in api.d.ts
export function generate({
  version,
  libraries,
  typeNameFix,
  strict,
  printValidationErrors = true,
}: {
  version: string;
  libraries: Record<string, Json>;
  typeNameFix: TypeNameFix;
  strict: boolean;
  printValidationErrors?: boolean;
}): UI5SemanticModel {
  const jsonSymbols = newMap<ConcreteSymbol>();
  const model = convertToSemanticModel(
    libraries,
    jsonSymbols,
    strict,
    printValidationErrors
  );
  generateMissingSymbols(model, strict);
  resolveSemanticProperties(model, jsonSymbols, typeNameFix, strict);
  model.version = version;
  return deepFreezeStrict(model);
}

export { forEachSymbol, findSymbol } from "./utils";
