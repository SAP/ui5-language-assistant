# Change Log

## 4.0.13

### Patch Changes

- Updated dependencies [ad36b43]
  - @ui5-language-assistant/constant@0.0.3

## 4.0.12

### Patch Changes

- Updated dependencies [c8bb0ec]
  - @ui5-language-assistant/constant@0.0.2

## 4.0.11

### Patch Changes

- b2a8d01: fix: introduce constant package to handle UI5 default version in central package
- Updated dependencies [b2a8d01]
  - @ui5-language-assistant/constant@0.0.1

## 4.0.10

### Patch Changes

- 7edb021: Fix semantic model for UI5, starting from version 1.121.0

## 4.0.9

### Patch Changes

- 905a6be: Support aggregation binding info

## 4.0.8

### Patch Changes

- 9df89eb: Use json api

## 4.0.7

### Patch Changes

- f670b06: Semantic model is adapted to support returnTypes defined in element metadata in api.json

## 4.0.6

### Patch Changes

- d8b77af: Provide a minimal code completion and syntax check for property binding info

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.5](https://github.com/sap/ui5-language-assistant/compare/v4.0.4...v4.0.5) (2023-02-28)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model-types

## [4.0.4](https://github.com/sap/ui5-language-assistant/compare/v4.0.3...v4.0.4) (2023-02-16)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model-types

## [4.0.3](https://github.com/sap/ui5-language-assistant/compare/v4.0.2...v4.0.3) (2023-01-30)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model-types

## [4.0.2](https://github.com/sap/ui5-language-assistant/compare/v4.0.1...v4.0.2) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model-types

## [4.0.1](https://github.com/sap/ui5-language-assistant/compare/v4.0.0...v4.0.1) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model-types

# [4.0.0](https://github.com/sap/ui5-language-assistant/compare/v3.3.1...v4.0.0) (2023-01-26)

### Bug Fixes

- show ui diagnostics if minUI5 version undefined in manifest.json or unsupported ([#536](https://github.com/sap/ui5-language-assistant/issues/536)) ([06ced88](https://github.com/sap/ui5-language-assistant/commit/06ced889db7ce5da00e5c2957f05a1b1a62441a3))

### Features

- annotation relevant lsp package ([#535](https://github.com/sap/ui5-language-assistant/issues/535)) ([6b35d43](https://github.com/sap/ui5-language-assistant/commit/6b35d43e91753eef6bcd215d894ce69472b77863))

### BREAKING CHANGES

- introduce context by pr #523

Co-authored-by: Klaus Keller <klaus.keller@sap.com>

## [3.3.1](https://github.com/sap/ui5-language-assistant/compare/v3.3.0...v3.3.1) (2022-09-01)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model-types

# [3.3.0](https://github.com/sap/ui5-language-assistant/compare/v3.2.1...v3.3.0) (2022-08-24)

### Features

- add framework awareness by reading closest ui5.yaml ([#481](https://github.com/sap/ui5-language-assistant/issues/481)) ([9a81530](https://github.com/sap/ui5-language-assistant/commit/9a8153081def735df610b0709220411dd1ba0a69)), closes [#239](https://github.com/sap/ui5-language-assistant/issues/239)

## [3.2.1](https://github.com/sap/ui5-language-assistant/compare/v3.2.0...v3.2.1) (2022-08-20)

### Bug Fixes

- **language-server:** detect the UI5 version from closest manifest.json ([#472](https://github.com/sap/ui5-language-assistant/issues/472)) ([39c2728](https://github.com/sap/ui5-language-assistant/commit/39c2728809e02ac57e624c4b8e02a046d5f67b2d))

# [3.2.0](https://github.com/sap/ui5-language-assistant/compare/v3.1.0...v3.2.0) (2022-08-15)

### Features

- multi-version support for UI5 XMLView code completion ([#469](https://github.com/sap/ui5-language-assistant/issues/469)) ([6cca109](https://github.com/sap/ui5-language-assistant/commit/6cca1092e01fbb77fdc510d039f0ce94529b2a9e)), closes [#468](https://github.com/sap/ui5-language-assistant/issues/468)

## [3.0.1](https://github.com/sap/ui5-language-assistant/compare/v3.0.0...v3.0.1) (2021-06-01)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model-types

# 3.0.0 (2021-06-01)

### Features

- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/sap/ui5-language-assistant/issues/103)) ([f109686](https://github.com/sap/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))
- **semantic-model:** add experimental information ([#56](https://github.com/sap/ui5-language-assistant/issues/56)) ([f55098d](https://github.com/sap/ui5-language-assistant/commit/f55098dc7fc949395efef04335667a0bc55e9d8e))
- **semantic-model:** fix properties and add fields on class, improve type system ([#25](https://github.com/sap/ui5-language-assistant/issues/25)) ([55d392e](https://github.com/sap/ui5-language-assistant/commit/55d392ed01dfc7d40b6ae57bb9ae92464dffee95))
- **semantic-model:** implement semantic model for UI5 ([#12](https://github.com/sap/ui5-language-assistant/issues/12)) ([225361d](https://github.com/sap/ui5-language-assistant/commit/225361dfa3e1d9a7a5d84eb80c7cc9e7c04a1269))
- **xml-views-completion:** classes suggestions ([#50](https://github.com/sap/ui5-language-assistant/issues/50)) ([42a62b6](https://github.com/sap/ui5-language-assistant/commit/42a62b64d73862b5f4fe34b803964ffe98431f38))
- **xml-views-completion:** do not suggest abstract classes in XM… ([#44](https://github.com/sap/ui5-language-assistant/issues/44)) ([cd0f38f](https://github.com/sap/ui5-language-assistant/commit/cd0f38f683e56c2cd19ee9adee9f21bc22bd0a0c))

## [1.3.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model-types@1.3.0...@ui5-language-assistant/semantic-model-types@1.3.1) (2020-08-27)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model-types

# [1.3.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model-types@1.2.0...@ui5-language-assistant/semantic-model-types@1.3.0) (2020-05-20)

### Features

- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/sap/ui5-language-assistant/issues/103)) ([f109686](https://github.com/sap/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))

# [1.2.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model-types@1.1.0...@ui5-language-assistant/semantic-model-types@1.2.0) (2020-04-23)

### Features

- **semantic-model:** add experimental information ([#56](https://github.com/sap/ui5-language-assistant/issues/56)) ([f55098d](https://github.com/sap/ui5-language-assistant/commit/f55098dc7fc949395efef04335667a0bc55e9d8e))

# [1.1.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model-types@1.0.0...@ui5-language-assistant/semantic-model-types@1.1.0) (2020-04-07)

### Features

- **xml-views-completion:** do not suggest abstract classes in XM… ([#44](https://github.com/sap/ui5-language-assistant/issues/44)) ([cd0f38f](https://github.com/sap/ui5-language-assistant/commit/cd0f38f683e56c2cd19ee9adee9f21bc22bd0a0c))

# 1.0.0 (2020-03-31)

### Features

- **semantic-model:** fix properties and add fields on class, improve type system ([#25](https://github.com/sap/ui5-language-assistant/issues/25)) ([55d392e](https://github.com/sap/ui5-language-assistant/commit/55d392ed01dfc7d40b6ae57bb9ae92464dffee95))
- **semantic-model:** implement semantic model for UI5 ([#12](https://github.com/sap/ui5-language-assistant/issues/12)) ([225361d](https://github.com/sap/ui5-language-assistant/commit/225361dfa3e1d9a7a5d84eb80c7cc9e7c04a1269))
- **xml-views-completion:** classes suggestions ([#50](https://github.com/sap/ui5-language-assistant/issues/50)) ([42a62b6](https://github.com/sap/ui5-language-assistant/commit/42a62b64d73862b5f4fe34b803964ffe98431f38))
