import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";

export type TypeNameFix = Parameters<typeof generate>[0]["typeNameFix"];

export type Json = unknown;

export declare const GENERATED_LIBRARY: string;

/**
 * Create a UI5 semantic model based on the sent libraries loaded from api.json files.
 * @param opts.libraries - Map of library name to library content loaded from api.json file
 * @param opts.typeNameFix - Map from type name that should be fixed due to a typo in the api.json to the fixed name (or undefined if it should be removed).
 * @param opts.strict - If true, throw an error when encountering an unexpected structure or value in a library. Default is true.
 */
export function generate(opts: {
  libraries: Record<string, Json>;
  typeNameFix: Record<string, string | undefined>;
  strict?: boolean;
}): UI5SemanticModel;
