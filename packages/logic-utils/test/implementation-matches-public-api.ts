import * as publicApi from "../api";
import * as implementation from "../src/api";

type AssertIsSubSet<SUBSET extends SUPERSET, SUPERSET> = [SUBSET, SUPERSET];

// TODO: export these helper types from test-utils
type EnsureAllDeclaredAreExposedAtRuntime = AssertIsSubSet<
  typeof implementation,
  typeof publicApi
>;

type EnsureNoRedundantAreExposedAtRuntime = AssertIsSubSet<
  typeof publicApi,
  typeof implementation
>;
