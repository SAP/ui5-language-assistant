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
  UI5DeprecatedInfo
} from "@ui5-language-assistant/semantic-model-types";
import { TypeNameFix } from "@ui5-language-assistant/semantic-model";
import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { UI5XMLViewCompletion } from "@ui5-language-assistant/xml-views-completion";
import { FetchResponse } from "@ui5-language-assistant/language-server";

//	easily build (partial) data structures for tests with mandatory "name" field
export type PartialWithName<T> = { name: string } & Partial<T>;

export function buildUI5Class(opts: PartialWithName<UI5Class>): UI5Class;

export function buildUI5Interface(
  opts: PartialWithName<UI5Interface>
): UI5Interface;

export function buildUI5Enum(opts: PartialWithName<UI5Enum>): UI5Enum;

export function buildUI5Typedef(opts: PartialWithName<UI5Typedef>): UI5Typedef;

export function buildUI5Function(
  opts: PartialWithName<UI5Function>
): UI5Function;

export function buildUI5Namespace(
  opts: PartialWithName<UI5Namespace>
): UI5Namespace;

export function buildUI5Property(opts: PartialWithName<UI5Prop>): UI5Prop;

export function buildUI5Field(opts: PartialWithName<UI5Field>): UI5Field;

export function buildUI5EnumValue(
  opts: PartialWithName<UI5EnumValue>
): UI5EnumValue;

export function buildUI5Event(opts: PartialWithName<UI5Event>): UI5Event;

export function buildUI5Method(opts: PartialWithName<UI5Method>): UI5Method;

export function buildUI5Constructor(
  opts: Partial<UI5Constructor>
): UI5Constructor;

export function buildUI5Association(
  opts: PartialWithName<UI5Association>
): UI5Association;

export function buildUI5Aggregation(
  opts: PartialWithName<UI5Aggregation>
): UI5Aggregation;

export function buildUI5DeprecatedInfo(
  opts: Partial<UI5DeprecatedInfo>
): UI5DeprecatedInfo;

export function buildUI5Model(
  opts: Partial<UI5SemanticModel>
): UI5SemanticModel;

export type TestModelVersion = "1.60.14" | "1.74.0" | "1.75.0" | "1.71.14";

/**
 * Return a UI5SemanticModel for the specified version.
 *
 * If downloadLibraries is true (default), increase the timeout of the test/hook to GEN_MODEL_TIMEOUT.
 *
 * @param opts.version
 * @param opts.downloadLibraries By default, download the library files before creating the model.
 *        If you call downloadLibraries explicitly before this function, send false (it will improve the performance).
 * @param opts.fixLibs Apply fixes to the model so that it can be created in strict mode. True by default.
 * @param opts.strict Generate the model in strict mode. True by default.
 */
export function generateModel(opts: {
  version: TestModelVersion;
  downloadLibs?: boolean;
  fixLibs?: boolean;
  strict?: boolean;
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

export function isObject(value: unknown): value is Record<string, unknown>;

export function getFQN(model: UI5SemanticModel, target: unknown): string;

export function expectExists(value: unknown, message: string): asserts value;

export function expectProperty<T>(
  value: unknown,
  property: keyof T & string,
  message: string
): asserts value is T;

export function expectModelObjectsEqual(
  model: UI5SemanticModel,
  value: unknown,
  expectedValue: unknown,
  message: string
): void;

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

/**
 * generateModel can take a long time in some cases now that it might download the libraries.
 * Use this constant to set the timeout on the test/hook that calls it.
 * Note: this.timeout(...) cannot be called from within an arrow function.
 */
export const GEN_MODEL_TIMEOUT = 5000;
