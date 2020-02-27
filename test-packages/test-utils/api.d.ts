import {
  UI5Class,
  UI5Namespace,
  UI5Aggregation,
  UI5SemanticModel
} from "@vscode-ui5/semantic-model-types";
import { Json, TypeNameFix } from "@vscode-ui5/semantic-model";

//	easily build (partial) data structures for tests with mandatory "name" field
export type PartialWithName<T> = { name: string } & Partial<T>;

export function buildUI5Class(opts: PartialWithName<UI5Class>): UI5Class;

export function buildUI5Namespace(
  opts: PartialWithName<UI5Namespace>
): UI5Namespace;

export function buildUI5Aggregation(
  opts: PartialWithName<UI5Aggregation>
): UI5Aggregation;

export function buildUI5Model(
  opts: PartialWithName<UI5SemanticModel>
): UI5SemanticModel;

export type TestModelVersion = "1.60.14" | "1.74.0";
export function generateModel(version: TestModelVersion): UI5SemanticModel;

export function loadLibraries(version: TestModelVersion): Record<string, Json>;

export function getTypeNameFixForVersion(
  version: TestModelVersion
): TypeNameFix;
