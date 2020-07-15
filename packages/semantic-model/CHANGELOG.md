# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
