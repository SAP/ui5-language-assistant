import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
import { TypeNameFix, Json } from "../api";
import { Symbol as JsonSymbol } from "./apiJson";
import { convertToSemanticModel } from "./convert";
import { resolveSemanticProperties } from "./resolve";
import { generateMissingSymbols } from "./enhance";
import { newMap } from "./utils";

export const GENERATED_LIBRARY = "Generated";

// See comment in api.d.ts
export function generate({
  libraries,
  typeNameFix,
  strict = true
}: {
  libraries: Record<string, Json>;
  typeNameFix: TypeNameFix;
  strict?: boolean;
}): UI5SemanticModel {
  const jsonSymbols = newMap<JsonSymbol>();
  const model = convertToSemanticModel(libraries, jsonSymbols, strict);
  generateMissingSymbols(model, strict);
  resolveSemanticProperties(model, jsonSymbols, typeNameFix, strict);
  return model;
}
