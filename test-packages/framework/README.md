# @ui5-language-assistant/test-framework

## Core principle

Core idea of test-framework package is to have blueprint project and create copy of blueprint project. User can manipulate copied project and read its content afterwards to get required artifacts (e.g. cst, ast, tokenVector, manifest, metadata) for test.

### Public API

Public API is documented in `src/types.ts`. See `interface TestFrameworkAPI`. One of the best place to experiment public API is test. See `test/framework-spec.ts` file

**Note** This package is meant only for internal use
