import {
  UI5Class,
  UI5Namespace,
  UI5Aggregation,
  UI5SemanticModel,
  UI5Prop,
  UI5Event
} from "@vscode-ui5/semantic-model-types";
import { Json, TypeNameFix } from "@vscode-ui5/semantic-model";
import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { XMLViewCompletion } from "@vscode-ui5/xml-views-completion";

//	easily build (partial) data structures for tests with mandatory "name" field
export type PartialWithName<T> = { name: string } & Partial<T>;

export function buildUI5Class(opts: PartialWithName<UI5Class>): UI5Class;

export function buildUI5Namespace(
  opts: PartialWithName<UI5Namespace>
): UI5Namespace;

export function buildUI5Property(opts: PartialWithName<UI5Prop>): UI5Prop;

export function buildUI5Event(opts: PartialWithName<UI5Event>): UI5Event;

export function buildUI5Aggregation(
  opts: PartialWithName<UI5Aggregation>
): UI5Aggregation;

export function buildUI5Model(
  opts: Partial<UI5SemanticModel>
): UI5SemanticModel;

export type TestModelVersion = "1.60.14" | "1.74.0";

/**
 * Return a UI5SemanticModel for the specified version.
 * @param version
 * @param disableCache By default caching is used. This improves performance and is safe (since the model is immutable).
 */
export function generateModel(
  version: TestModelVersion,
  disableCache?: boolean
): UI5SemanticModel;

export function loadLibraries(version: TestModelVersion): Record<string, Json>;

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
  actualNameGetter: (suggestion: XMLViewCompletion) => string,
  suggestions: XMLViewCompletion[],
  expected: string[]
): void;
