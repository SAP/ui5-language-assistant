# Change Log

## 4.0.21

### Patch Changes

- Updated dependencies [ad36b43]
  - @ui5-language-assistant/constant@0.0.3
  - @ui5-language-assistant/semantic-model-types@4.0.13

## 4.0.20

### Patch Changes

- Updated dependencies [c8bb0ec]
  - @ui5-language-assistant/constant@0.0.2
  - @ui5-language-assistant/semantic-model-types@4.0.12

## 4.0.19

### Patch Changes

- @ui5-language-assistant/logger@0.0.2

## 4.0.18

### Patch Changes

- b2a8d01: fix: introduce constant package to handle UI5 default version in central package
- Updated dependencies [b2a8d01]
  - @ui5-language-assistant/semantic-model-types@4.0.11
  - @ui5-language-assistant/constant@0.0.1

## 4.0.17

### Patch Changes

- 7edb021: Fix semantic model for UI5, starting from version 1.121.0
- Updated dependencies [7edb021]
  - @ui5-language-assistant/semantic-model-types@4.0.10

## 4.0.16

### Patch Changes

- 0186685: Fallback to the latest supported patch version

## 4.0.15

### Patch Changes

- a9a2141: Add logger package

## 4.0.14

### Patch Changes

- 910e437: Adaptation to the latest UI5 maintenance changes

## 4.0.13

### Patch Changes

- ccd5eae: Adapt non stable id message

## 4.0.12

### Patch Changes

- 905a6be: Support aggregation binding info
- Updated dependencies [905a6be]
  - @ui5-language-assistant/semantic-model-types@4.0.9

## 4.0.11

### Patch Changes

- 9df89eb: Use json api
- Updated dependencies [9df89eb]
  - @ui5-language-assistant/semantic-model-types@4.0.8

## 4.0.10

### Patch Changes

- f670b06: Semantic model is adapted to support returnTypes defined in element metadata in api.json
- Updated dependencies [f670b06]
  - @ui5-language-assistant/semantic-model-types@4.0.7

## 4.0.9

### Patch Changes

- d8b77af: Provide a minimal code completion and syntax check for property binding info
- Updated dependencies [d8b77af]
  - @ui5-language-assistant/semantic-model-types@4.0.6

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

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

## [4.0.4](https://github.com/sap/ui5-language-assistant/compare/v4.0.3...v4.0.4) (2023-02-16)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

## [4.0.3](https://github.com/sap/ui5-language-assistant/compare/v4.0.2...v4.0.3) (2023-01-30)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

## [4.0.2](https://github.com/sap/ui5-language-assistant/compare/v4.0.1...v4.0.2) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

## [4.0.1](https://github.com/sap/ui5-language-assistant/compare/v4.0.0...v4.0.1) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

# [4.0.0](https://github.com/sap/ui5-language-assistant/compare/v3.3.1...v4.0.0) (2023-01-26)

### Bug Fixes

- api json schema fix ([#548](https://github.com/sap/ui5-language-assistant/issues/548)) ([0701631](https://github.com/sap/ui5-language-assistant/commit/07016319d02bbc4a9058efff6ff9feac949defbf))
- show ui diagnostics if minUI5 version undefined in manifest.json or unsupported ([#536](https://github.com/sap/ui5-language-assistant/issues/536)) ([06ced88](https://github.com/sap/ui5-language-assistant/commit/06ced889db7ce5da00e5c2957f05a1b1a62441a3))

### Features

- annotation relevant lsp package ([#535](https://github.com/sap/ui5-language-assistant/issues/535)) ([6b35d43](https://github.com/sap/ui5-language-assistant/commit/6b35d43e91753eef6bcd215d894ce69472b77863))

### BREAKING CHANGES

- introduce context by pr #523

Co-authored-by: Klaus Keller <klaus.keller@sap.com>

## [3.3.1](https://github.com/sap/ui5-language-assistant/compare/v3.3.0...v3.3.1) (2022-09-01)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

# [3.3.0](https://github.com/sap/ui5-language-assistant/compare/v3.2.1...v3.3.0) (2022-08-24)

### Features

- **language-server:** proxy support ([#478](https://github.com/sap/ui5-language-assistant/issues/478)) ([916d1e8](https://github.com/sap/ui5-language-assistant/commit/916d1e8d7f8309ddac19364d903357143442b7b0))

## [3.2.1](https://github.com/sap/ui5-language-assistant/compare/v3.2.0...v3.2.1) (2022-08-20)

### Bug Fixes

- **language-server:** detect the UI5 version from closest manifest.json ([#472](https://github.com/sap/ui5-language-assistant/issues/472)) ([39c2728](https://github.com/sap/ui5-language-assistant/commit/39c2728809e02ac57e624c4b8e02a046d5f67b2d))

# [3.2.0](https://github.com/sap/ui5-language-assistant/compare/v3.1.0...v3.2.0) (2022-08-15)

### Features

- multi-version support for UI5 XMLView code completion ([#469](https://github.com/sap/ui5-language-assistant/issues/469)) ([6cca109](https://github.com/sap/ui5-language-assistant/commit/6cca1092e01fbb77fdc510d039f0ce94529b2a9e)), closes [#468](https://github.com/sap/ui5-language-assistant/issues/468)

## [3.0.1](https://github.com/sap/ui5-language-assistant/compare/v3.0.0...v3.0.1) (2021-06-01)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

# 3.0.0 (2021-06-01)

### Bug Fixes

- remove message for "sap.ui.vk.BaseNodeProxy" on library startup ([#130](https://github.com/sap/ui5-language-assistant/issues/130)) ([eb5c6d3](https://github.com/sap/ui5-language-assistant/commit/eb5c6d3a6da7a1580a199f214d4e855853095335))
- **semantic-model:** workaround for api does not match impel issue ([#21](https://github.com/sap/ui5-language-assistant/issues/21)) ([39eeeab](https://github.com/sap/ui5-language-assistant/commit/39eeeabfac2012b7d5de0be39e9686535589f7ad))

### Features

- add settings to include deprecated and experimental APIs ([#143](https://github.com/sap/ui5-language-assistant/issues/143)) ([fad2d9b](https://github.com/sap/ui5-language-assistant/commit/fad2d9b0c998fa2a1f3d8d4cd7ba8e997d24d30b))
- **semantic-model:** set content as View default aggregation ([#125](https://github.com/sap/ui5-language-assistant/issues/125)) ([6d34f3e](https://github.com/sap/ui5-language-assistant/commit/6d34f3e6438ab322aad450c7231a73876231f1ea))
- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/sap/ui5-language-assistant/issues/103)) ([f109686](https://github.com/sap/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))
- **semantic-model:** add experimental information ([#56](https://github.com/sap/ui5-language-assistant/issues/56)) ([f55098d](https://github.com/sap/ui5-language-assistant/commit/f55098dc7fc949395efef04335667a0bc55e9d8e))
- **semantic-model:** implement semantic model for UI5 ([#12](https://github.com/sap/ui5-language-assistant/issues/12)) ([225361d](https://github.com/sap/ui5-language-assistant/commit/225361dfa3e1d9a7a5d84eb80c7cc9e7c04a1269))
- **semantic-model:** support special attributes - xml completion ([#55](https://github.com/sap/ui5-language-assistant/issues/55)) ([5ae0c3a](https://github.com/sap/ui5-language-assistant/commit/5ae0c3a818c6630de4503fc2551e568b6f3ce399))
- **xml-views-completion:** do not suggest abstract classes in XM… ([#44](https://github.com/sap/ui5-language-assistant/issues/44)) ([cd0f38f](https://github.com/sap/ui5-language-assistant/commit/cd0f38f683e56c2cd19ee9adee9f21bc22bd0a0c))
- support SAP UI5 Distribution libraries version 1.71.14 ([#39](https://github.com/sap/ui5-language-assistant/issues/39)) ([7589a8b](https://github.com/sap/ui5-language-assistant/commit/7589a8bb97a2cf387b66583229c12f3fa971c28e))
- **semantic-model:** fix properties and add fields on class, improve type system ([#25](https://github.com/sap/ui5-language-assistant/issues/25)) ([55d392e](https://github.com/sap/ui5-language-assistant/commit/55d392ed01dfc7d40b6ae57bb9ae92464dffee95))
- **semantic-model:** return frozen model ([#22](https://github.com/sap/ui5-language-assistant/issues/22)) ([12a3041](https://github.com/sap/ui5-language-assistant/commit/12a30411c103f28d47ea79a25f10ce94dea5ec06))
- logic utils ([#8](https://github.com/sap/ui5-language-assistant/issues/8)) ([7328217](https://github.com/sap/ui5-language-assistant/commit/7328217088e82994cd7ff548a89a4a3c48cf9a76))
- **xml-views-completion:** aggregations auto-complete ([#4](https://github.com/sap/ui5-language-assistant/issues/4)) ([20caf48](https://github.com/sap/ui5-language-assistant/commit/20caf48ba4669f15df6778988c2ba63a45aa9599))

### Reverts

- Revert "build: remove usage of TypeScript pre-processor for testing flows" ([83b73a2](https://github.com/sap/ui5-language-assistant/commit/83b73a2abe43be921873670f2c6bce75f9bd1685))

## [1.4.7](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model@1.4.6...@ui5-language-assistant/semantic-model@1.4.7) (2021-05-04)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

## [1.4.6](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model@1.4.5...@ui5-language-assistant/semantic-model@1.4.6) (2021-01-03)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

## [1.4.5](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model@1.4.4...@ui5-language-assistant/semantic-model@1.4.5) (2020-12-30)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

## [1.4.4](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model@1.4.3...@ui5-language-assistant/semantic-model@1.4.4) (2020-08-27)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

## [1.4.3](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model@1.4.2...@ui5-language-assistant/semantic-model@1.4.3) (2020-07-15)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

## [1.4.2](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model@1.4.1...@ui5-language-assistant/semantic-model@1.4.2) (2020-07-08)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

## [1.4.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model@1.4.0...@ui5-language-assistant/semantic-model@1.4.1) (2020-06-29)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

# [1.4.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model@1.3.1...@ui5-language-assistant/semantic-model@1.4.0) (2020-06-17)

### Features

- add settings to include deprecated and experimental APIs ([#143](https://github.com/sap/ui5-language-assistant/issues/143)) ([fad2d9b](https://github.com/sap/ui5-language-assistant/commit/fad2d9b0c998fa2a1f3d8d4cd7ba8e997d24d30b))

## [1.3.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model@1.3.0...@ui5-language-assistant/semantic-model@1.3.1) (2020-06-03)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

# [1.3.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model@1.2.1...@ui5-language-assistant/semantic-model@1.3.0) (2020-05-20)

### Bug Fixes

- remove message for "sap.ui.vk.BaseNodeProxy" on library startup ([#130](https://github.com/sap/ui5-language-assistant/issues/130)) ([eb5c6d3](https://github.com/sap/ui5-language-assistant/commit/eb5c6d3a6da7a1580a199f214d4e855853095335))

### Features

- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/sap/ui5-language-assistant/issues/103)) ([f109686](https://github.com/sap/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))
- **semantic-model:** set content as View default aggregation ([#125](https://github.com/sap/ui5-language-assistant/issues/125)) ([6d34f3e](https://github.com/sap/ui5-language-assistant/commit/6d34f3e6438ab322aad450c7231a73876231f1ea))

## [1.2.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model@1.2.0...@ui5-language-assistant/semantic-model@1.2.1) (2020-05-06)

**Note:** Version bump only for package @ui5-language-assistant/semantic-model

# [1.2.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model@1.1.0...@ui5-language-assistant/semantic-model@1.2.0) (2020-04-23)

### Features

- **semantic-model:** add experimental information ([#56](https://github.com/sap/ui5-language-assistant/issues/56)) ([f55098d](https://github.com/sap/ui5-language-assistant/commit/f55098dc7fc949395efef04335667a0bc55e9d8e))
- **semantic-model:** support special attributes - xml completion ([#55](https://github.com/sap/ui5-language-assistant/issues/55)) ([5ae0c3a](https://github.com/sap/ui5-language-assistant/commit/5ae0c3a818c6630de4503fc2551e568b6f3ce399))

# [1.1.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/semantic-model@1.0.0...@ui5-language-assistant/semantic-model@1.1.0) (2020-04-07)

### Features

- support SAPUI5 Distribution libraries version 1.71.14 ([#39](https://github.com/sap/ui5-language-assistant/issues/39)) ([7589a8b](https://github.com/sap/ui5-language-assistant/commit/7589a8bb97a2cf387b66583229c12f3fa971c28e))
- **xml-views-completion:** do not suggest abstract classes in XM… ([#44](https://github.com/sap/ui5-language-assistant/issues/44)) ([cd0f38f](https://github.com/sap/ui5-language-assistant/commit/cd0f38f683e56c2cd19ee9adee9f21bc22bd0a0c))

# 1.0.0 (2020-03-31)

### Bug Fixes

- **semantic-model:** workaround for api does not match impel issue ([#21](https://github.com/sap/ui5-language-assistant/issues/21)) ([39eeeab](https://github.com/sap/ui5-language-assistant/commit/39eeeabfac2012b7d5de0be39e9686535589f7ad))

### Features

- **semantic-model:** fix properties and add fields on class, improve type system ([#25](https://github.com/sap/ui5-language-assistant/issues/25)) ([55d392e](https://github.com/sap/ui5-language-assistant/commit/55d392ed01dfc7d40b6ae57bb9ae92464dffee95))
- **semantic-model:** implement semantic model for UI5 ([#12](https://github.com/sap/ui5-language-assistant/issues/12)) ([225361d](https://github.com/sap/ui5-language-assistant/commit/225361dfa3e1d9a7a5d84eb80c7cc9e7c04a1269))
- **semantic-model:** return frozen model ([#22](https://github.com/sap/ui5-language-assistant/issues/22)) ([12a3041](https://github.com/sap/ui5-language-assistant/commit/12a30411c103f28d47ea79a25f10ce94dea5ec06))
- logic utils ([#8](https://github.com/sap/ui5-language-assistant/issues/8)) ([7328217](https://github.com/sap/ui5-language-assistant/commit/7328217088e82994cd7ff548a89a4a3c48cf9a76))
- **xml-views-completion:** aggregations auto-complete ([#4](https://github.com/sap/ui5-language-assistant/issues/4)) ([20caf48](https://github.com/sap/ui5-language-assistant/commit/20caf48ba4669f15df6778988c2ba63a45aa9599))

### Reverts

- Revert "build: remove usage of TypeScript pre-processor for testing flows" ([83b73a2](https://github.com/sap/ui5-language-assistant/commit/83b73a2abe43be921873670f2c6bce75f9bd1685))
