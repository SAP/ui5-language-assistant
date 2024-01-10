import {
  UI5Aggregation,
  UI5Association,
  UI5Class,
  UI5Event,
  UI5Namespace,
  UI5Prop,
  UI5SemanticModel,
  UI5Interface,
  UI5Enum,
  UI5Typedef,
  UI5Function,
  UI5Method,
  UI5Constructor,
  UI5Field,
  UI5EnumValue,
  UI5DeprecatedInfo,
  UI5Framework,
} from "@ui5-language-assistant/semantic-model-types";
import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { UI5XMLViewCompletion } from "@ui5-language-assistant/xml-views-completion";
import { FetchResponse } from "@ui5-language-assistant/language-server";

//	easily build (partial) data structures for tests with mandatory "name" field
export type PartialWithName<T> = { name: string } & Partial<T>;

export function buildUI5Class<T extends PartialWithName<UI5Class>>(
  opts: T
): UI5Class & Pick<T, keyof UI5Class>;

export function buildUI5Interface<T extends PartialWithName<UI5Interface>>(
  opts: T
): UI5Interface & Pick<T, keyof UI5Interface>;

export function buildUI5Enum<T extends PartialWithName<UI5Enum>>(
  opts: T
): UI5Enum & Pick<T, keyof UI5Enum>;

export function buildUI5Typedef<T extends PartialWithName<UI5Typedef>>(
  opts: T
): UI5Typedef & Pick<T, keyof UI5Typedef>;

export function buildUI5Function<T extends PartialWithName<UI5Function>>(
  opts: T
): UI5Function & Pick<T, keyof UI5Function>;

export function buildUI5Namespace<T extends PartialWithName<UI5Namespace>>(
  opts: T
): UI5Namespace & Pick<T, keyof UI5Namespace>;

export function buildUI5Property<T extends PartialWithName<UI5Prop>>(
  opts: T
): UI5Prop & Pick<T, keyof UI5Prop>;

export function buildUI5Field<T extends PartialWithName<UI5Field>>(
  opts: T
): UI5Field & Pick<T, keyof UI5Field>;

export function buildUI5EnumValue<T extends PartialWithName<UI5EnumValue>>(
  opts: T
): UI5EnumValue & Pick<T, keyof UI5EnumValue>;

export function buildUI5Event<T extends PartialWithName<UI5Event>>(
  opts: T
): UI5Event & Pick<T, keyof UI5Event>;

export function buildUI5Method<T extends PartialWithName<UI5Method>>(
  opts: T
): UI5Method & Pick<T, keyof UI5Method>;

export function buildUI5Constructor<T extends Partial<UI5Constructor>>(
  opts: T
): UI5Constructor & Pick<T, keyof UI5Constructor>;

export function buildUI5Association<T extends PartialWithName<UI5Association>>(
  opts: T
): UI5Association & Pick<T, keyof UI5Association>;

export function buildUI5Aggregation<T extends PartialWithName<UI5Aggregation>>(
  opts: T
): UI5Aggregation & Pick<T, keyof UI5Aggregation>;

export function buildUI5DeprecatedInfo<T extends Partial<UI5DeprecatedInfo>>(
  opts: T
): UI5DeprecatedInfo & Pick<T, keyof UI5DeprecatedInfo>;

export function buildUI5Model<T extends Partial<UI5SemanticModel>>(
  opts: Partial<UI5SemanticModel>
): UI5SemanticModel & Pick<T, keyof UI5SemanticModel>;

export const DEFAULT_UI5_VERSION = "1.71.61";

// TODO: list should be updated continuously!
export type TestModelVersion =
  | /* OOM */ typeof DEFAULT_UI5_VERSION
  | "1.84.41"
  | "1.96.27"
  | "1.108.26"
  | "1.114.11";

/**
 * Return a UI5SemanticModel for the specified version.
 *
 * If downloadLibraries is true (default), increase the timeout of the test/hook to GEN_MODEL_TIMEOUT.
 *
 * @param opts.framework
 * @param opts.version
 * @param opts.downloadLibraries - By default, download the library files before creating the model.
 * @param opts.strict - Generate the model in strict mode. True by default.
 * @param opts.modelGenerator - DI for the actual api.json -> UI5Model builder, pass the `generate`
 *                              function from the @ui5-language-assistant/semantic-model package.
 *                              This DI is needed to avoid cyclic dependency graph.
 *                              ... -> semantic-model -> test-utils -> semantic-model -> ...
 */
export function generateModel(opts: {
  framework: UI5Framework;
  version: TestModelVersion;
  downloadLibs?: boolean;
  strict?: boolean;
  modelGenerator: generateFunc;
}): Promise<UI5SemanticModel>;

export function getTypeNameFixForVersion(
  version: TestModelVersion
): TypeNameFix;

export function expectUnsortedEquality(
  actual: string[],
  expected: string[]
): void;

export function expectXMLAttribute(
  astNode: XMLElement | XMLAttribute
): asserts astNode is XMLAttribute;

export function expectExists(value: unknown, message: string): asserts value;

export function expectProperty<T>(
  value: unknown,
  property: keyof T & string,
  message: string
): asserts value is T;

export function expectSuggestions(
  actualNameGetter: (suggestion: UI5XMLViewCompletion) => string,
  suggestions: UI5XMLViewCompletion[],
  expected: string[]
): void;

export function readTestLibraryFile(
  version: string,
  fileName: string
): Promise<FetchResponse>;

export function downloadLibraries(version: TestModelVersion): Promise<void>;

// These types are **duplicated** from `semantic-model` package
// to avoid **cyclic** package dependencies.
// As this is a **test** package, this workaround is preferable to the overhead of
// creating a new production package only for these types, nor do they
// belong in semantic-model-types packages.
export type TypeNameFix = Record<string, string | undefined>;
export type Json = unknown;

export type generateFunc = (opts: {
  framework: UI5Framework;
  version: string;
  libraries: Record<string, Json>;
  typeNameFix: TypeNameFix;
  strict: boolean;
  printValidationErrors?: boolean;
}) => UI5SemanticModel;

export async function getFallbackPatchVersions(): Promise<{
  SAPUI5: string | undefined;
  OpenUI5: string | undefined;
}>;
