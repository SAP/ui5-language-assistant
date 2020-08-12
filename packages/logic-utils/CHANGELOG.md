# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
