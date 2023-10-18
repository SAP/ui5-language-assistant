# Change Log

## 4.0.14

### Patch Changes

- 905a6be: Support aggregation binding info
- Updated dependencies [905a6be]
  - @ui5-language-assistant/semantic-model-types@4.0.9

## 4.0.13

### Patch Changes

- 8fff87d: releax typedefs validation

## 4.0.12

### Patch Changes

- Updated dependencies [9df89eb]
  - @ui5-language-assistant/semantic-model-types@4.0.8

## 4.0.11

### Patch Changes

- f670b06: Semantic model is adapted to support returnTypes defined in element metadata in api.json
- Updated dependencies [f670b06]
  - @ui5-language-assistant/semantic-model-types@4.0.7

## 4.0.10

### Patch Changes

- d8b77af: Provide a minimal code completion and syntax check for property binding info
- Updated dependencies [d8b77af]
  - @ui5-language-assistant/semantic-model-types@4.0.6
  - @ui5-language-assistant/settings@4.0.9

## 4.0.9

### Patch Changes

- c73d4fd: Unit test coverage improvement. Migration to Jest test framework
- Updated dependencies [c73d4fd]
  - @ui5-language-assistant/settings@4.0.8

## 4.0.8

### Patch Changes

- dff4ba6: Enable formatting
- Updated dependencies [dff4ba6]
  - @ui5-language-assistant/settings@4.0.7

## 4.0.7

### Patch Changes

- 0af5e7d: Upgrade prettier

## 4.0.6

### Patch Changes

- 930a813: Offline mode support
- Updated dependencies [930a813]
  - @ui5-language-assistant/settings@4.0.6

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.5](https://github.com/sap/ui5-language-assistant/compare/v4.0.4...v4.0.5) (2023-02-28)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

## [4.0.4](https://github.com/sap/ui5-language-assistant/compare/v4.0.3...v4.0.4) (2023-02-16)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

## [4.0.3](https://github.com/sap/ui5-language-assistant/compare/v4.0.2...v4.0.3) (2023-01-30)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

## [4.0.2](https://github.com/sap/ui5-language-assistant/compare/v4.0.1...v4.0.2) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

## [4.0.1](https://github.com/sap/ui5-language-assistant/compare/v4.0.0...v4.0.1) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

# [4.0.0](https://github.com/sap/ui5-language-assistant/compare/v3.3.1...v4.0.0) (2023-01-26)

### Bug Fixes

- duplicate code completion items ([#500](https://github.com/sap/ui5-language-assistant/issues/500)) ([4ad8c80](https://github.com/sap/ui5-language-assistant/commit/4ad8c802566e33bed8c4aa729b06410ec6faed93))

### Features

- introduce context package ([#523](https://github.com/sap/ui5-language-assistant/issues/523)) ([ce59328](https://github.com/sap/ui5-language-assistant/commit/ce59328b229cd55a2b2e606afd50785feffab5a5))

## [3.3.1](https://github.com/sap/ui5-language-assistant/compare/v3.3.0...v3.3.1) (2022-09-01)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

# [3.3.0](https://github.com/sap/ui5-language-assistant/compare/v3.2.1...v3.3.0) (2022-08-24)

### Bug Fixes

- **language-server:** ensure proper urls for topic links ([#484](https://github.com/sap/ui5-language-assistant/issues/484)) ([0869f72](https://github.com/sap/ui5-language-assistant/commit/0869f7269bf015a6e56cda4eec446617814261ae)), closes [#444](https://github.com/sap/ui5-language-assistant/issues/444)

### Features

- **language-server:** proxy support ([#478](https://github.com/sap/ui5-language-assistant/issues/478)) ([916d1e8](https://github.com/sap/ui5-language-assistant/commit/916d1e8d7f8309ddac19364d903357143442b7b0))
- add framework awareness by reading closest ui5.yaml ([#481](https://github.com/sap/ui5-language-assistant/issues/481)) ([9a81530](https://github.com/sap/ui5-language-assistant/commit/9a8153081def735df610b0709220411dd1ba0a69)), closes [#239](https://github.com/sap/ui5-language-assistant/issues/239)

## [3.2.1](https://github.com/sap/ui5-language-assistant/compare/v3.2.0...v3.2.1) (2022-08-20)

### Bug Fixes

- **language-server:** detect the UI5 version from closest manifest.json ([#472](https://github.com/sap/ui5-language-assistant/issues/472)) ([39c2728](https://github.com/sap/ui5-language-assistant/commit/39c2728809e02ac57e624c4b8e02a046d5f67b2d))

# [3.2.0](https://github.com/sap/ui5-language-assistant/compare/v3.1.0...v3.2.0) (2022-08-15)

### Features

- multi-version support for UI5 XMLView code completion ([#469](https://github.com/sap/ui5-language-assistant/issues/469)) ([6cca109](https://github.com/sap/ui5-language-assistant/commit/6cca1092e01fbb77fdc510d039f0ce94529b2a9e)), closes [#468](https://github.com/sap/ui5-language-assistant/issues/468)

## [3.0.1](https://github.com/sap/ui5-language-assistant/compare/v3.0.0...v3.0.1) (2021-06-01)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

# 3.0.0 (2021-06-01)

### Bug Fixes

- don't allow to use classes from sub-namespace in tag ([#155](https://github.com/sap/ui5-language-assistant/issues/155)) ([cb96c80](https://github.com/sap/ui5-language-assistant/commit/cb96c80890f74f8d4ce90648ea6b1f2d915bfccc))
- support namespace in aggregation name ([#150](https://github.com/sap/ui5-language-assistant/issues/150)) ([cff718b](https://github.com/sap/ui5-language-assistant/commit/cff718b4a2cfddc01cc5e44bd42eca68a8831832))
- use description first line without jsdoc tags in deprecation warning ([#141](https://github.com/sap/ui5-language-assistant/issues/141)) ([9cf89eb](https://github.com/sap/ui5-language-assistant/commit/9cf89ebda9dbf80c00b499e66cb44fabeb4d3553))
- **logic-utils:** avoid infinite loops in getSuperClass() ([#8](https://github.com/sap/ui5-language-assistant/issues/8)) ([45b769c](https://github.com/sap/ui5-language-assistant/commit/45b769c13d651d2e77c6d401e776994515c1e1ea))
- **logic-utils:** take transitive interfaces into account in type… ([#6](https://github.com/sap/ui5-language-assistant/issues/6)) ([846321b](https://github.com/sap/ui5-language-assistant/commit/846321be0636aecabe57a044538d3e00540ea90c))

### Features

- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/sap/ui5-language-assistant/issues/103)) ([f109686](https://github.com/sap/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))
- associations suggestions ([#4](https://github.com/sap/ui5-language-assistant/issues/4)) ([4b439bf](https://github.com/sap/ui5-language-assistant/commit/4b439bfd628d564b9154aaa08624e9920a1a8360))
- deprecated attribute validation ([#183](https://github.com/sap/ui5-language-assistant/issues/183)) ([f2d2923](https://github.com/sap/ui5-language-assistant/commit/f2d29237e633cf30454f7ecba03fed1e940e999f))
- logic utils ([#8](https://github.com/sap/ui5-language-assistant/issues/8)) ([7328217](https://github.com/sap/ui5-language-assistant/commit/7328217088e82994cd7ff548a89a4a3c48cf9a76))
- non stable id quick fix ([#266](https://github.com/sap/ui5-language-assistant/issues/266)) ([c564db4](https://github.com/sap/ui5-language-assistant/commit/c564db4ed7a5ec9e026be0f10a72c734a366c3f7))
- properties and event names suggestions ([#14](https://github.com/sap/ui5-language-assistant/issues/14)) ([96db377](https://github.com/sap/ui5-language-assistant/commit/96db37770f094c7b5437098651a75f287fdb7858))
- suggest UI5 namespaces in xmlns attributes values ([#17](https://github.com/sap/ui5-language-assistant/issues/17)) ([46c84c4](https://github.com/sap/ui5-language-assistant/commit/46c84c4c5e2030fea255895a06cecbb5828fe31b))
- type aggregation validation ([#164](https://github.com/sap/ui5-language-assistant/issues/164)) ([63c5b5a](https://github.com/sap/ui5-language-assistant/commit/63c5b5a9ddcd10a5557b7b69c94371f2bebab7f6))
- validate attribute key is known in class and aggregation tags ([#120](https://github.com/sap/ui5-language-assistant/issues/120)) ([443e13b](https://github.com/sap/ui5-language-assistant/commit/443e13b55b22d982391f1d3972ea97f350d472a9))
- validate boolean value in property ([#113](https://github.com/sap/ui5-language-assistant/issues/113)) ([59d3a69](https://github.com/sap/ui5-language-assistant/commit/59d3a699c7557bc25adfbf19091981813bade4b0))
- validate tag name is known ([#129](https://github.com/sap/ui5-language-assistant/issues/129)) ([eaf494c](https://github.com/sap/ui5-language-assistant/commit/eaf494c5278d8c1200925a01daabcde9942f8dbc))
- **language-server:** completion response improvements ([#16](https://github.com/sap/ui5-language-assistant/issues/16)) ([a17904e](https://github.com/sap/ui5-language-assistant/commit/a17904eac77ebc9087056a9808ab8449ad2dc38c))
- **semantic-model:** implement semantic model for UI5 ([#12](https://github.com/sap/ui5-language-assistant/issues/12)) ([225361d](https://github.com/sap/ui5-language-assistant/commit/225361dfa3e1d9a7a5d84eb80c7cc9e7c04a1269))
- **xml-views-completion:** classes suggestions ([#50](https://github.com/sap/ui5-language-assistant/issues/50)) ([42a62b6](https://github.com/sap/ui5-language-assistant/commit/42a62b64d73862b5f4fe34b803964ffe98431f38))
- **xml-views-completion:** filter on sap.ui.core.Element (not Control) ([#44](https://github.com/sap/ui5-language-assistant/issues/44)) ([0991e6e](https://github.com/sap/ui5-language-assistant/commit/0991e6e4322b0b0fc374542c429931cc8552eb2b))

### Reverts

- Revert "build: remove usage of TypeScript pre-processor for testing flows" ([83b73a2](https://github.com/sap/ui5-language-assistant/commit/83b73a2abe43be921873670f2c6bce75f9bd1685))

## [1.4.4](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.4.3...@ui5-language-assistant/logic-utils@1.4.4) (2021-05-04)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

## [1.4.3](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.4.2...@ui5-language-assistant/logic-utils@1.4.3) (2021-01-03)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

## [1.4.2](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.4.1...@ui5-language-assistant/logic-utils@1.4.2) (2020-12-30)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

## [1.4.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.4.0...@ui5-language-assistant/logic-utils@1.4.1) (2020-08-27)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

# [1.4.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.3.3...@ui5-language-assistant/logic-utils@1.4.0) (2020-08-12)

### Features

- non stable id quick fix ([#266](https://github.com/sap/ui5-language-assistant/issues/266)) ([c564db4](https://github.com/sap/ui5-language-assistant/commit/c564db4ed7a5ec9e026be0f10a72c734a366c3f7))

## [1.3.3](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.3.2...@ui5-language-assistant/logic-utils@1.3.3) (2020-07-15)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

## [1.3.2](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.3.1...@ui5-language-assistant/logic-utils@1.3.2) (2020-07-08)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

## [1.3.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.3.0...@ui5-language-assistant/logic-utils@1.3.1) (2020-06-29)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

# [1.3.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.2.1...@ui5-language-assistant/logic-utils@1.3.0) (2020-06-17)

### Features

- deprecated attribute validation ([#183](https://github.com/sap/ui5-language-assistant/issues/183)) ([f2d2923](https://github.com/sap/ui5-language-assistant/commit/f2d29237e633cf30454f7ecba03fed1e940e999f))
- type aggregation validation ([#164](https://github.com/sap/ui5-language-assistant/issues/164)) ([63c5b5a](https://github.com/sap/ui5-language-assistant/commit/63c5b5a9ddcd10a5557b7b69c94371f2bebab7f6))

## [1.2.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.2.0...@ui5-language-assistant/logic-utils@1.2.1) (2020-06-03)

### Bug Fixes

- don't allow to use classes from sub-namespace in tag ([#155](https://github.com/sap/ui5-language-assistant/issues/155)) ([cb96c80](https://github.com/sap/ui5-language-assistant/commit/cb96c80890f74f8d4ce90648ea6b1f2d915bfccc))
- support namespace in aggregation name ([#150](https://github.com/sap/ui5-language-assistant/issues/150)) ([cff718b](https://github.com/sap/ui5-language-assistant/commit/cff718b4a2cfddc01cc5e44bd42eca68a8831832))
- use description first line without jsdoc tags in deprecation warning ([#141](https://github.com/sap/ui5-language-assistant/issues/141)) ([9cf89eb](https://github.com/sap/ui5-language-assistant/commit/9cf89ebda9dbf80c00b499e66cb44fabeb4d3553))

# [1.2.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.1.3...@ui5-language-assistant/logic-utils@1.2.0) (2020-05-20)

### Features

- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/sap/ui5-language-assistant/issues/103)) ([f109686](https://github.com/sap/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))
- validate attribute key is known in class and aggregation tags ([#120](https://github.com/sap/ui5-language-assistant/issues/120)) ([443e13b](https://github.com/sap/ui5-language-assistant/commit/443e13b55b22d982391f1d3972ea97f350d472a9))
- validate boolean value in property ([#113](https://github.com/sap/ui5-language-assistant/issues/113)) ([59d3a69](https://github.com/sap/ui5-language-assistant/commit/59d3a699c7557bc25adfbf19091981813bade4b0))
- validate tag name is known ([#129](https://github.com/sap/ui5-language-assistant/issues/129)) ([eaf494c](https://github.com/sap/ui5-language-assistant/commit/eaf494c5278d8c1200925a01daabcde9942f8dbc))

## [1.1.3](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.1.2...@ui5-language-assistant/logic-utils@1.1.3) (2020-05-06)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

## [1.1.2](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.1.1...@ui5-language-assistant/logic-utils@1.1.2) (2020-04-23)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

## [1.1.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.1.0...@ui5-language-assistant/logic-utils@1.1.1) (2020-04-07)

**Note:** Version bump only for package @ui5-language-assistant/logic-utils

# [1.1.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/logic-utils@1.0.0...@ui5-language-assistant/logic-utils@1.1.0) (2020-04-01)

### Features

- suggest UI5 namespaces in xmlns attributes values ([#17](https://github.com/sap/ui5-language-assistant/issues/17)) ([46c84c4](https://github.com/sap/ui5-language-assistant/commit/46c84c4c5e2030fea255895a06cecbb5828fe31b))

# 1.0.0 (2020-03-31)

### Bug Fixes

- **logic-utils:** avoid infinite loops in getSuperClass() ([#8](https://github.com/sap/ui5-language-assistant/issues/8)) ([45b769c](https://github.com/sap/ui5-language-assistant/commit/45b769c13d651d2e77c6d401e776994515c1e1ea))
- **logic-utils:** take transitive interfaces into account in type… ([#6](https://github.com/sap/ui5-language-assistant/issues/6)) ([846321b](https://github.com/sap/ui5-language-assistant/commit/846321be0636aecabe57a044538d3e00540ea90c))

### Features

- **language-server:** completion response improvements ([#16](https://github.com/sap/ui5-language-assistant/issues/16)) ([a17904e](https://github.com/sap/ui5-language-assistant/commit/a17904eac77ebc9087056a9808ab8449ad2dc38c))
- associations suggestions ([#4](https://github.com/sap/ui5-language-assistant/issues/4)) ([4b439bf](https://github.com/sap/ui5-language-assistant/commit/4b439bfd628d564b9154aaa08624e9920a1a8360))
- **xml-views-completion:** classes suggestions ([#50](https://github.com/sap/ui5-language-assistant/issues/50)) ([42a62b6](https://github.com/sap/ui5-language-assistant/commit/42a62b64d73862b5f4fe34b803964ffe98431f38))
- **xml-views-completion:** filter on sap.ui.core.Element (not Control) ([#44](https://github.com/sap/ui5-language-assistant/issues/44)) ([0991e6e](https://github.com/sap/ui5-language-assistant/commit/0991e6e4322b0b0fc374542c429931cc8552eb2b))
- properties and event names suggestions ([#14](https://github.com/sap/ui5-language-assistant/issues/14)) ([96db377](https://github.com/sap/ui5-language-assistant/commit/96db37770f094c7b5437098651a75f287fdb7858))
- **semantic-model:** implement semantic model for UI5 ([#12](https://github.com/sap/ui5-language-assistant/issues/12)) ([225361d](https://github.com/sap/ui5-language-assistant/commit/225361dfa3e1d9a7a5d84eb80c7cc9e7c04a1269))
- logic utils ([#8](https://github.com/sap/ui5-language-assistant/issues/8)) ([7328217](https://github.com/sap/ui5-language-assistant/commit/7328217088e82994cd7ff548a89a4a3c48cf9a76))

### Reverts

- Revert "build: remove usage of TypeScript pre-processor for testing flows" ([83b73a2](https://github.com/sap/ui5-language-assistant/commit/83b73a2abe43be921873670f2c6bce75f9bd1685))
