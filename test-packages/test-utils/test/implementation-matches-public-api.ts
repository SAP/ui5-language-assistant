import * as publicApi from "../api";
import * as implementation from "../src/api";

// https://www.typescriptlang.org/docs/handbook/generics.html#generic-constraints
type AssertIsSubSet<SUBSET extends SUPERSET, SUPERSET> = [SUBSET, SUPERSET];

// TODO: export these helper types from test-utils
// Because TypeScript uses a Structural Typing system
// We can perform logical assertions on the API vs Impel
// using discrete math semantics (subsets/supersets)
// See: https://www.typescriptlang.org/docs/handbook/type-compatibility.html
type EnsureAllDeclaredAreExposedAtRuntime = AssertIsSubSet<
  typeof implementation,
  typeof publicApi
>;

type EnsureNoRedundantAreExposedAtRuntime = AssertIsSubSet<
  typeof publicApi,
  typeof implementation
>;
