import {
  BaseUI5Node,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";

export type TypeNameFix = Record<string, string | undefined>;

export type Json = unknown;

export declare const GENERATED_LIBRARY: string;

/**
 * Create a UI5 semantic model based on the sent libraries loaded from api.json files.
 * @param opts.libraries - Map of library name to library content loaded from api.json file
 * @param opts.typeNameFix - Map from type name that should be fixed due to a typo in the api.json to the fixed name (or undefined if it should be removed).
 * @param opts.strict - If true, throw an error when encountering an unexpected structure or value in a library. Default is true.
 */
export function generate(opts: {
  version: string;
  libraries: Record<string, Json>;
  typeNameFix: TypeNameFix;
  strict: boolean;
  printValidationErrors?: boolean;
  isFallback?: boolean;
  isIncorrectVersion?: boolean;
}): UI5SemanticModel;

/**
 * Run the iteratee on each root symbol in the model
 * @param model
 * @param iteratee
 */
export function forEachSymbol(
  model: UI5SemanticModel,
  iteratee: (symbol: BaseUI5Node, fqn: string) => boolean | void
): void;

/**
 * Return a root symbol according to its fully qualified name, or undefined if not found
 * @param model
 * @param fqn
 */
export function findSymbol(
  model: UI5SemanticModel,
  fqn: string
): BaseUI5Node | undefined;
