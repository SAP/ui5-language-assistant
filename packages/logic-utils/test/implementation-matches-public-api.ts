import * as publicApi from "../api";
import * as implementation from "../src/api";

type AssertExtends<IMPLEMENTATION extends PUBLIC_API, PUBLIC_API> = [
  IMPLEMENTATION,
  PUBLIC_API
];

type EnsureAllDeclaredAreExposedAtRuntime = AssertExtends<
  typeof implementation,
  typeof publicApi
>;

type EnsureNoRedundantAreExposedAtRuntime = AssertExtends<
  typeof publicApi,
  typeof implementation
>;
