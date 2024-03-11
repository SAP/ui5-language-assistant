# Change Log

## 4.0.13

### Patch Changes

- 7edb021: Fix semantic model for UI5, starting from version 1.121.0

## 4.0.12

### Patch Changes

- 0186685: Fallback to the latest supported patch version

## 4.0.11

### Patch Changes

- a9a2141: Add logger package

## 4.0.10

### Patch Changes

- 910e437: Adaptation to the latest UI5 maintenance changes

## 4.0.9

### Patch Changes

- 9df89eb: Use json api

## 4.0.8

### Patch Changes

- c73d4fd: Unit test coverage improvement. Migration to Jest test framework

## 4.0.7

### Patch Changes

- dff4ba6: Enable formatting

## 4.0.6

### Patch Changes

- 0af5e7d: Upgrade prettier

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.5](https://github.com/sap/ui5-language-assistant/compare/v4.0.4...v4.0.5) (2023-02-28)

**Note:** Version bump only for package @ui5-language-assistant/test-utils

## [4.0.4](https://github.com/sap/ui5-language-assistant/compare/v4.0.3...v4.0.4) (2023-02-16)

**Note:** Version bump only for package @ui5-language-assistant/test-utils

## [4.0.3](https://github.com/sap/ui5-language-assistant/compare/v4.0.2...v4.0.3) (2023-01-30)

**Note:** Version bump only for package @ui5-language-assistant/test-utils

## [4.0.2](https://github.com/sap/ui5-language-assistant/compare/v4.0.1...v4.0.2) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/test-utils

## [4.0.1](https://github.com/sap/ui5-language-assistant/compare/v4.0.0...v4.0.1) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/test-utils

# [4.0.0](https://github.com/sap/ui5-language-assistant/compare/v3.3.1...v4.0.0) (2023-01-26)

### Features

- annotation relevant lsp package ([#535](https://github.com/sap/ui5-language-assistant/issues/535)) ([6b35d43](https://github.com/sap/ui5-language-assistant/commit/6b35d43e91753eef6bcd215d894ce69472b77863))

### BREAKING CHANGES

- introduce context by pr #523

Co-authored-by: Klaus Keller <klaus.keller@sap.com>

## [3.3.1](https://github.com/sap/ui5-language-assistant/compare/v3.3.0...v3.3.1) (2022-09-01)

**Note:** Version bump only for package @ui5-language-assistant/test-utils

# [3.3.0](https://github.com/sap/ui5-language-assistant/compare/v3.2.1...v3.3.0) (2022-08-24)

### Features

- **language-server:** proxy support ([#478](https://github.com/sap/ui5-language-assistant/issues/478)) ([916d1e8](https://github.com/sap/ui5-language-assistant/commit/916d1e8d7f8309ddac19364d903357143442b7b0))

# [3.2.0](https://github.com/sap/ui5-language-assistant/compare/v3.1.0...v3.2.0) (2022-08-15)

### Features

- multi-version support for UI5 XMLView code completion ([#469](https://github.com/sap/ui5-language-assistant/issues/469)) ([6cca109](https://github.com/sap/ui5-language-assistant/commit/6cca1092e01fbb77fdc510d039f0ce94529b2a9e)), closes [#468](https://github.com/sap/ui5-language-assistant/issues/468)

## [3.0.1](https://github.com/sap/ui5-language-assistant/compare/v3.0.0...v3.0.1) (2021-06-01)

**Note:** Version bump only for package @ui5-language-assistant/test-utils

# 3.0.0 (2021-06-01)

### Bug Fixes

- remove message for "sap.ui.vk.BaseNodeProxy" on library startup ([#130](https://github.com/sap/ui5-language-assistant/issues/130)) ([eb5c6d3](https://github.com/sap/ui5-language-assistant/commit/eb5c6d3a6da7a1580a199f214d4e855853095335))
- use description first line without jsdoc tags in deprecation warning ([#141](https://github.com/sap/ui5-language-assistant/issues/141)) ([9cf89eb](https://github.com/sap/ui5-language-assistant/commit/9cf89ebda9dbf80c00b499e66cb44fabeb4d3553))

### Features

- add support for code completion of boolean properties values ([#66](https://github.com/sap/ui5-language-assistant/issues/66)) ([d95ead4](https://github.com/sap/ui5-language-assistant/commit/d95ead46697b6508785aa331c7594b0c20470582))
- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/sap/ui5-language-assistant/issues/103)) ([f109686](https://github.com/sap/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))
- **language-server:** completion response improvements ([#16](https://github.com/sap/ui5-language-assistant/issues/16)) ([a17904e](https://github.com/sap/ui5-language-assistant/commit/a17904eac77ebc9087056a9808ab8449ad2dc38c))
- **semantic-model:** add experimental information ([#56](https://github.com/sap/ui5-language-assistant/issues/56)) ([f55098d](https://github.com/sap/ui5-language-assistant/commit/f55098dc7fc949395efef04335667a0bc55e9d8e))
- **semantic-model:** fix properties and add fields on class, improve type system ([#25](https://github.com/sap/ui5-language-assistant/issues/25)) ([55d392e](https://github.com/sap/ui5-language-assistant/commit/55d392ed01dfc7d40b6ae57bb9ae92464dffee95))
- **semantic-model:** implement semantic model for UI5 ([#12](https://github.com/sap/ui5-language-assistant/issues/12)) ([225361d](https://github.com/sap/ui5-language-assistant/commit/225361dfa3e1d9a7a5d84eb80c7cc9e7c04a1269))
- **xml-views-completion:** do not suggest abstract classes in XM… ([#44](https://github.com/sap/ui5-language-assistant/issues/44)) ([cd0f38f](https://github.com/sap/ui5-language-assistant/commit/cd0f38f683e56c2cd19ee9adee9f21bc22bd0a0c))
- **xml-views-validation:** skeleton ([#67](https://github.com/sap/ui5-language-assistant/issues/67)) ([e4b79ce](https://github.com/sap/ui5-language-assistant/commit/e4b79ce04869214c842a2d6a373b6a09c2e5ab22))
- add ui5 language server and client vscode extension ([18a6350](https://github.com/sap/ui5-language-assistant/commit/18a635087de1846bb7f21e6dc4c3833e77dd8cfc))
- associations suggestions ([#4](https://github.com/sap/ui5-language-assistant/issues/4)) ([4b439bf](https://github.com/sap/ui5-language-assistant/commit/4b439bfd628d564b9154aaa08624e9920a1a8360))
- implemented suggestions of namespaces keys ([#47](https://github.com/sap/ui5-language-assistant/issues/47)) ([f4880ea](https://github.com/sap/ui5-language-assistant/commit/f4880ea3f9105cac0d6d6a1606c18b9081893313))
- properties and event names suggestions ([#14](https://github.com/sap/ui5-language-assistant/issues/14)) ([96db377](https://github.com/sap/ui5-language-assistant/commit/96db37770f094c7b5437098651a75f287fdb7858))
- support SAP UI5 Distribution libraries version 1.71.14 ([#39](https://github.com/sap/ui5-language-assistant/issues/39)) ([7589a8b](https://github.com/sap/ui5-language-assistant/commit/7589a8bb97a2cf387b66583229c12f3fa971c28e))

### Reverts

- Revert "build: remove usage of TypeScript pre-processor for testing flows" ([83b73a2](https://github.com/sap/ui5-language-assistant/commit/83b73a2abe43be921873670f2c6bce75f9bd1685))

## [1.4.5](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/test-utils@1.4.4...@ui5-language-assistant/test-utils@1.4.5) (2021-05-04)

**Note:** Version bump only for package @ui5-language-assistant/test-utils

## [1.4.4](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/test-utils@1.4.3...@ui5-language-assistant/test-utils@1.4.4) (2020-12-30)

**Note:** Version bump only for package @ui5-language-assistant/test-utils

## [1.4.3](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/test-utils@1.4.2...@ui5-language-assistant/test-utils@1.4.3) (2020-06-29)

**Note:** Version bump only for package @ui5-language-assistant/test-utils

## [1.4.2](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/test-utils@1.4.1...@ui5-language-assistant/test-utils@1.4.2) (2020-06-17)

**Note:** Version bump only for package @ui5-language-assistant/test-utils

## [1.4.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/test-utils@1.4.0...@ui5-language-assistant/test-utils@1.4.1) (2020-06-03)

### Bug Fixes

- use description first line without jsdoc tags in deprecation warning ([#141](https://github.com/sap/ui5-language-assistant/issues/141)) ([9cf89eb](https://github.com/sap/ui5-language-assistant/commit/9cf89ebda9dbf80c00b499e66cb44fabeb4d3553))

# [1.4.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/test-utils@1.3.0...@ui5-language-assistant/test-utils@1.4.0) (2020-05-20)

### Bug Fixes

- remove message for "sap.ui.vk.BaseNodeProxy" on library startup ([#130](https://github.com/sap/ui5-language-assistant/issues/130)) ([eb5c6d3](https://github.com/sap/ui5-language-assistant/commit/eb5c6d3a6da7a1580a199f214d4e855853095335))

### Features

- add support for code completion of boolean properties values ([#66](https://github.com/sap/ui5-language-assistant/issues/66)) ([d95ead4](https://github.com/sap/ui5-language-assistant/commit/d95ead46697b6508785aa331c7594b0c20470582))
- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/sap/ui5-language-assistant/issues/103)) ([f109686](https://github.com/sap/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))

# [1.3.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/test-utils@1.2.0...@ui5-language-assistant/test-utils@1.3.0) (2020-05-06)

### Features

- **xml-views-validation:** skeleton ([#67](https://github.com/sap/ui5-language-assistant/issues/67)) ([e4b79ce](https://github.com/sap/ui5-language-assistant/commit/e4b79ce04869214c842a2d6a373b6a09c2e5ab22))

# [1.2.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/test-utils@1.1.0...@ui5-language-assistant/test-utils@1.2.0) (2020-04-23)

### Features

- **semantic-model:** add experimental information ([#56](https://github.com/sap/ui5-language-assistant/issues/56)) ([f55098d](https://github.com/sap/ui5-language-assistant/commit/f55098dc7fc949395efef04335667a0bc55e9d8e))

# [1.1.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/test-utils@1.0.0...@ui5-language-assistant/test-utils@1.1.0) (2020-04-07)

### Features

- support SAPUI5 Distribution libraries version 1.71.14 ([#39](https://github.com/sap/ui5-language-assistant/issues/39)) ([7589a8b](https://github.com/sap/ui5-language-assistant/commit/7589a8bb97a2cf387b66583229c12f3fa971c28e))
- **xml-views-completion:** do not suggest abstract classes in XM… ([#44](https://github.com/sap/ui5-language-assistant/issues/44)) ([cd0f38f](https://github.com/sap/ui5-language-assistant/commit/cd0f38f683e56c2cd19ee9adee9f21bc22bd0a0c))

# 1.0.0 (2020-03-31)

### Features

- **language-server:** completion response improvements ([#16](https://github.com/sap/ui5-language-assistant/issues/16)) ([a17904e](https://github.com/sap/ui5-language-assistant/commit/a17904eac77ebc9087056a9808ab8449ad2dc38c))
- add ui5 language server and client vscode extension ([18a6350](https://github.com/sap/ui5-language-assistant/commit/18a635087de1846bb7f21e6dc4c3833e77dd8cfc))
- associations suggestions ([#4](https://github.com/sap/ui5-language-assistant/issues/4)) ([4b439bf](https://github.com/sap/ui5-language-assistant/commit/4b439bfd628d564b9154aaa08624e9920a1a8360))
- implemented suggestions of namespaces keys ([#47](https://github.com/sap/ui5-language-assistant/issues/47)) ([f4880ea](https://github.com/sap/ui5-language-assistant/commit/f4880ea3f9105cac0d6d6a1606c18b9081893313))
- properties and event names suggestions ([#14](https://github.com/sap/ui5-language-assistant/issues/14)) ([96db377](https://github.com/sap/ui5-language-assistant/commit/96db37770f094c7b5437098651a75f287fdb7858))
- **semantic-model:** fix properties and add fields on class, improve type system ([#25](https://github.com/sap/ui5-language-assistant/issues/25)) ([55d392e](https://github.com/sap/ui5-language-assistant/commit/55d392ed01dfc7d40b6ae57bb9ae92464dffee95))
- **semantic-model:** implement semantic model for UI5 ([#12](https://github.com/sap/ui5-language-assistant/issues/12)) ([225361d](https://github.com/sap/ui5-language-assistant/commit/225361dfa3e1d9a7a5d84eb80c7cc9e7c04a1269))

### Reverts

- Revert "build: remove usage of TypeScript pre-processor for testing flows" ([83b73a2](https://github.com/sap/ui5-language-assistant/commit/83b73a2abe43be921873670f2c6bce75f9bd1685))
