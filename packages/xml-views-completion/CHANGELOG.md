# Change Log

## 4.0.16

### Patch Changes

- Updated dependencies [1a96f91]
  - @ui5-language-assistant/context@4.0.16

## 4.0.15

### Patch Changes

- @ui5-language-assistant/context@4.0.15
- @ui5-language-assistant/logic-utils@4.0.12

## 4.0.14

### Patch Changes

- Updated dependencies [f670b06]
  - @ui5-language-assistant/logic-utils@4.0.11
  - @ui5-language-assistant/context@4.0.14

## 4.0.13

### Patch Changes

- d8b77af: Provide a minimal code completion and syntax check for property binding info
- Updated dependencies [d8b77af]
  - @ui5-language-assistant/logic-utils@4.0.10
  - @ui5-language-assistant/context@4.0.13

## 4.0.12

### Patch Changes

- Updated dependencies [e3a6a0b]
  - @ui5-language-assistant/context@4.0.12

## 4.0.11

### Patch Changes

- Updated dependencies [2a3d618]
  - @ui5-language-assistant/context@4.0.11

## 4.0.10

### Patch Changes

- c73d4fd: Unit test coverage improvement. Migration to Jest test framework
- Updated dependencies [c73d4fd]
  - @ui5-language-assistant/logic-utils@4.0.9
  - @ui5-language-assistant/context@4.0.10

## 4.0.9

### Patch Changes

- dff4ba6: Enable formatting
- Updated dependencies [dff4ba6]
  - @ui5-language-assistant/logic-utils@4.0.8
  - @ui5-language-assistant/context@4.0.9

## 4.0.8

### Patch Changes

- 0af5e7d: Upgrade prettier
- Updated dependencies [0af5e7d]
  - @ui5-language-assistant/logic-utils@4.0.7
  - @ui5-language-assistant/context@4.0.8

## 4.0.7

### Patch Changes

- Updated dependencies [527f153]
  - @ui5-language-assistant/context@4.0.7

## 4.0.6

### Patch Changes

- Updated dependencies [930a813]
  - @ui5-language-assistant/context@4.0.6
  - @ui5-language-assistant/logic-utils@4.0.6

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.5](https://github.com/sap/ui5-language-assistant/compare/v4.0.4...v4.0.5) (2023-02-28)

### Bug Fixes

- completion in FragmentDefinition ([#567](https://github.com/sap/ui5-language-assistant/issues/567)) ([44d780b](https://github.com/sap/ui5-language-assistant/commit/44d780bc0666ea9055ed4ed797da26a119e91d21))

## [4.0.4](https://github.com/sap/ui5-language-assistant/compare/v4.0.3...v4.0.4) (2023-02-16)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

## [4.0.3](https://github.com/sap/ui5-language-assistant/compare/v4.0.2...v4.0.3) (2023-01-30)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

## [4.0.2](https://github.com/sap/ui5-language-assistant/compare/v4.0.1...v4.0.2) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

## [4.0.1](https://github.com/sap/ui5-language-assistant/compare/v4.0.0...v4.0.1) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

# [4.0.0](https://github.com/sap/ui5-language-assistant/compare/v3.3.1...v4.0.0) (2023-01-26)

### Bug Fixes

- code completion in default aggregation ([#499](https://github.com/sap/ui5-language-assistant/issues/499)) ([a0f4043](https://github.com/sap/ui5-language-assistant/commit/a0f404339385c0cee63b59cb27dadc2e715e44d7))

### Features

- annotation relevant lsp package ([#535](https://github.com/sap/ui5-language-assistant/issues/535)) ([6b35d43](https://github.com/sap/ui5-language-assistant/commit/6b35d43e91753eef6bcd215d894ce69472b77863))
- introduce context package ([#523](https://github.com/sap/ui5-language-assistant/issues/523)) ([ce59328](https://github.com/sap/ui5-language-assistant/commit/ce59328b229cd55a2b2e606afd50785feffab5a5))

### BREAKING CHANGES

- introduce context by pr #523

Co-authored-by: Klaus Keller <klaus.keller@sap.com>

## [3.3.1](https://github.com/sap/ui5-language-assistant/compare/v3.3.0...v3.3.1) (2022-09-01)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

# [3.3.0](https://github.com/sap/ui5-language-assistant/compare/v3.2.1...v3.3.0) (2022-08-24)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

## [3.2.1](https://github.com/sap/ui5-language-assistant/compare/v3.2.0...v3.2.1) (2022-08-20)

### Bug Fixes

- **language-server:** detect the UI5 version from closest manifest.json ([#472](https://github.com/sap/ui5-language-assistant/issues/472)) ([39c2728](https://github.com/sap/ui5-language-assistant/commit/39c2728809e02ac57e624c4b8e02a046d5f67b2d))

# [3.2.0](https://github.com/sap/ui5-language-assistant/compare/v3.1.0...v3.2.0) (2022-08-15)

### Features

- multi-version support for UI5 XMLView code completion ([#469](https://github.com/sap/ui5-language-assistant/issues/469)) ([6cca109](https://github.com/sap/ui5-language-assistant/commit/6cca1092e01fbb77fdc510d039f0ce94529b2a9e)), closes [#468](https://github.com/sap/ui5-language-assistant/issues/468)

## [3.0.1](https://github.com/sap/ui5-language-assistant/compare/v3.0.0...v3.0.1) (2021-06-01)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

# 3.0.0 (2021-06-01)

### Bug Fixes

- don't offer classes from sub-namespaces in code completion ([#156](https://github.com/sap/ui5-language-assistant/issues/156)) ([a6f4ec3](https://github.com/sap/ui5-language-assistant/commit/a6f4ec37a9e496acd029aae43f7f82c65e7db8fa))
- support namespace in aggregation name ([#150](https://github.com/sap/ui5-language-assistant/issues/150)) ([cff718b](https://github.com/sap/ui5-language-assistant/commit/cff718b4a2cfddc01cc5e44bd42eca68a8831832))
- **language-server:** suggest current attribute name ([#99](https://github.com/sap/ui5-language-assistant/issues/99)) ([325e567](https://github.com/sap/ui5-language-assistant/commit/325e567ec63a5acd46a9d9dc882d5a7bd665f3b8))
- use prefix when suggesting namespaces in attribute value ([#62](https://github.com/sap/ui5-language-assistant/issues/62)) ([8019b4d](https://github.com/sap/ui5-language-assistant/commit/8019b4d96401a8c476493f2db49c8a2cc596caf3))

### Features

- add enum value code assist ([#37](https://github.com/sap/ui5-language-assistant/issues/37)) ([309c55c](https://github.com/sap/ui5-language-assistant/commit/309c55c6047438d75e0b68c47d686cf2778f27b7))
- add settings to include deprecated and experimental APIs ([#143](https://github.com/sap/ui5-language-assistant/issues/143)) ([fad2d9b](https://github.com/sap/ui5-language-assistant/commit/fad2d9b0c998fa2a1f3d8d4cd7ba8e997d24d30b))
- add support for code completion of boolean properties values ([#66](https://github.com/sap/ui5-language-assistant/issues/66)) ([d95ead4](https://github.com/sap/ui5-language-assistant/commit/d95ead46697b6508785aa331c7594b0c20470582))
- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/sap/ui5-language-assistant/issues/103)) ([f109686](https://github.com/sap/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))
- associations suggestions ([#4](https://github.com/sap/ui5-language-assistant/issues/4)) ([4b439bf](https://github.com/sap/ui5-language-assistant/commit/4b439bfd628d564b9154aaa08624e9920a1a8360))
- implemented suggestions of namespaces keys ([#47](https://github.com/sap/ui5-language-assistant/issues/47)) ([f4880ea](https://github.com/sap/ui5-language-assistant/commit/f4880ea3f9105cac0d6d6a1606c18b9081893313))
- logic utils ([#8](https://github.com/sap/ui5-language-assistant/issues/8)) ([7328217](https://github.com/sap/ui5-language-assistant/commit/7328217088e82994cd7ff548a89a4a3c48cf9a76))
- properties and event names suggestions ([#14](https://github.com/sap/ui5-language-assistant/issues/14)) ([96db377](https://github.com/sap/ui5-language-assistant/commit/96db37770f094c7b5437098651a75f287fdb7858))
- suggest UI5 namespaces in xmlns attributes values ([#17](https://github.com/sap/ui5-language-assistant/issues/17)) ([46c84c4](https://github.com/sap/ui5-language-assistant/commit/46c84c4c5e2030fea255895a06cecbb5828fe31b))
- validate attribute key is known in class and aggregation tags ([#120](https://github.com/sap/ui5-language-assistant/issues/120)) ([443e13b](https://github.com/sap/ui5-language-assistant/commit/443e13b55b22d982391f1d3972ea97f350d472a9))
- validate boolean value in property ([#113](https://github.com/sap/ui5-language-assistant/issues/113)) ([59d3a69](https://github.com/sap/ui5-language-assistant/commit/59d3a699c7557bc25adfbf19091981813bade4b0))
- **semantic-model:** implement semantic model for UI5 ([#12](https://github.com/sap/ui5-language-assistant/issues/12)) ([225361d](https://github.com/sap/ui5-language-assistant/commit/225361dfa3e1d9a7a5d84eb80c7cc9e7c04a1269))
- **semantic-model:** support special attributes - xml completion ([#55](https://github.com/sap/ui5-language-assistant/issues/55)) ([5ae0c3a](https://github.com/sap/ui5-language-assistant/commit/5ae0c3a818c6630de4503fc2551e568b6f3ce399))
- **xml-views-completion:** aggregations auto-complete ([#4](https://github.com/sap/ui5-language-assistant/issues/4)) ([20caf48](https://github.com/sap/ui5-language-assistant/commit/20caf48ba4669f15df6778988c2ba63a45aa9599))
- **xml-views-completion:** classes suggestions ([#50](https://github.com/sap/ui5-language-assistant/issues/50)) ([42a62b6](https://github.com/sap/ui5-language-assistant/commit/42a62b64d73862b5f4fe34b803964ffe98431f38))
- **xml-views-completion:** do not suggest abstract classes in XM… ([#44](https://github.com/sap/ui5-language-assistant/issues/44)) ([cd0f38f](https://github.com/sap/ui5-language-assistant/commit/cd0f38f683e56c2cd19ee9adee9f21bc22bd0a0c))
- **xml-views-completion:** filter on sap.ui.core.Element (not Control) ([#44](https://github.com/sap/ui5-language-assistant/issues/44)) ([0991e6e](https://github.com/sap/ui5-language-assistant/commit/0991e6e4322b0b0fc374542c429931cc8552eb2b))
- **xml-views-completion:** filter suggestions by visibility ([#28](https://github.com/sap/ui5-language-assistant/issues/28)) ([4ea75c5](https://github.com/sap/ui5-language-assistant/commit/4ea75c55c2f8ed44a3c0fb87fe29e0806543a070))
- **xml-views-completion:** suggest namespaces on non-class elements ([#52](https://github.com/sap/ui5-language-assistant/issues/52)) ([e651847](https://github.com/sap/ui5-language-assistant/commit/e651847587c9fb663b2c98e73179ed7e1999cf18))

### Reverts

- Revert "build: remove usage of TypeScript pre-processor for testing flows" ([83b73a2](https://github.com/sap/ui5-language-assistant/commit/83b73a2abe43be921873670f2c6bce75f9bd1685))

## [1.5.8](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.5.7...@ui5-language-assistant/xml-views-completion@1.5.8) (2021-05-04)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

## [1.5.7](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.5.6...@ui5-language-assistant/xml-views-completion@1.5.7) (2021-01-03)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

## [1.5.6](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.5.5...@ui5-language-assistant/xml-views-completion@1.5.6) (2020-12-30)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

## [1.5.5](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.5.4...@ui5-language-assistant/xml-views-completion@1.5.5) (2020-08-27)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

## [1.5.4](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.5.3...@ui5-language-assistant/xml-views-completion@1.5.4) (2020-08-12)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

## [1.5.3](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.5.2...@ui5-language-assistant/xml-views-completion@1.5.3) (2020-07-15)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

## [1.5.2](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.5.1...@ui5-language-assistant/xml-views-completion@1.5.2) (2020-07-08)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

## [1.5.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.5.0...@ui5-language-assistant/xml-views-completion@1.5.1) (2020-06-29)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-completion

# [1.5.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.4.1...@ui5-language-assistant/xml-views-completion@1.5.0) (2020-06-17)

### Features

- add settings to include deprecated and experimental APIs ([#143](https://github.com/sap/ui5-language-assistant/issues/143)) ([fad2d9b](https://github.com/sap/ui5-language-assistant/commit/fad2d9b0c998fa2a1f3d8d4cd7ba8e997d24d30b))

## [1.4.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.4.0...@ui5-language-assistant/xml-views-completion@1.4.1) (2020-06-03)

### Bug Fixes

- don't offer classes from sub-namespaces in code completion ([#156](https://github.com/sap/ui5-language-assistant/issues/156)) ([a6f4ec3](https://github.com/sap/ui5-language-assistant/commit/a6f4ec37a9e496acd029aae43f7f82c65e7db8fa))
- support namespace in aggregation name ([#150](https://github.com/sap/ui5-language-assistant/issues/150)) ([cff718b](https://github.com/sap/ui5-language-assistant/commit/cff718b4a2cfddc01cc5e44bd42eca68a8831832))

# [1.4.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.3.1...@ui5-language-assistant/xml-views-completion@1.4.0) (2020-05-20)

### Bug Fixes

- **language-server:** suggest current attribute name ([#99](https://github.com/sap/ui5-language-assistant/issues/99)) ([325e567](https://github.com/sap/ui5-language-assistant/commit/325e567ec63a5acd46a9d9dc882d5a7bd665f3b8))

### Features

- add support for code completion of boolean properties values ([#66](https://github.com/sap/ui5-language-assistant/issues/66)) ([d95ead4](https://github.com/sap/ui5-language-assistant/commit/d95ead46697b6508785aa331c7594b0c20470582))
- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/sap/ui5-language-assistant/issues/103)) ([f109686](https://github.com/sap/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))
- validate attribute key is known in class and aggregation tags ([#120](https://github.com/sap/ui5-language-assistant/issues/120)) ([443e13b](https://github.com/sap/ui5-language-assistant/commit/443e13b55b22d982391f1d3972ea97f350d472a9))
- validate boolean value in property ([#113](https://github.com/sap/ui5-language-assistant/issues/113)) ([59d3a69](https://github.com/sap/ui5-language-assistant/commit/59d3a699c7557bc25adfbf19091981813bade4b0))

## [1.3.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.3.0...@ui5-language-assistant/xml-views-completion@1.3.1) (2020-05-06)

### Bug Fixes

- use prefix when suggesting namespaces in attribute value ([#62](https://github.com/sap/ui5-language-assistant/issues/62)) ([8019b4d](https://github.com/sap/ui5-language-assistant/commit/8019b4d96401a8c476493f2db49c8a2cc596caf3))

# [1.3.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.2.0...@ui5-language-assistant/xml-views-completion@1.3.0) (2020-04-23)

### Features

- **semantic-model:** support special attributes - xml completion ([#55](https://github.com/sap/ui5-language-assistant/issues/55)) ([5ae0c3a](https://github.com/sap/ui5-language-assistant/commit/5ae0c3a818c6630de4503fc2551e568b6f3ce399))
- **xml-views-completion:** suggest namespaces on non-class elements ([#52](https://github.com/sap/ui5-language-assistant/issues/52)) ([e651847](https://github.com/sap/ui5-language-assistant/commit/e651847587c9fb663b2c98e73179ed7e1999cf18))

# [1.2.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.1.0...@ui5-language-assistant/xml-views-completion@1.2.0) (2020-04-07)

### Features

- **xml-views-completion:** do not suggest abstract classes in XM… ([#44](https://github.com/sap/ui5-language-assistant/issues/44)) ([cd0f38f](https://github.com/sap/ui5-language-assistant/commit/cd0f38f683e56c2cd19ee9adee9f21bc22bd0a0c))

# [1.1.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-completion@1.0.0...@ui5-language-assistant/xml-views-completion@1.1.0) (2020-04-01)

### Features

- suggest UI5 namespaces in xmlns attributes values ([#17](https://github.com/sap/ui5-language-assistant/issues/17)) ([46c84c4](https://github.com/sap/ui5-language-assistant/commit/46c84c4c5e2030fea255895a06cecbb5828fe31b))

# 1.0.0 (2020-03-31)

### Features

- associations suggestions ([#4](https://github.com/sap/ui5-language-assistant/issues/4)) ([4b439bf](https://github.com/sap/ui5-language-assistant/commit/4b439bfd628d564b9154aaa08624e9920a1a8360))
- **xml-views-completion:** classes suggestions ([#50](https://github.com/sap/ui5-language-assistant/issues/50)) ([42a62b6](https://github.com/sap/ui5-language-assistant/commit/42a62b64d73862b5f4fe34b803964ffe98431f38))
- add enum value code assist ([#37](https://github.com/sap/ui5-language-assistant/issues/37)) ([309c55c](https://github.com/sap/ui5-language-assistant/commit/309c55c6047438d75e0b68c47d686cf2778f27b7))
- implemented suggestions of namespaces keys ([#47](https://github.com/sap/ui5-language-assistant/issues/47)) ([f4880ea](https://github.com/sap/ui5-language-assistant/commit/f4880ea3f9105cac0d6d6a1606c18b9081893313))
- **xml-views-completion:** aggregations auto-complete ([#4](https://github.com/sap/ui5-language-assistant/issues/4)) ([20caf48](https://github.com/sap/ui5-language-assistant/commit/20caf48ba4669f15df6778988c2ba63a45aa9599))
- **xml-views-completion:** filter on sap.ui.core.Element (not Control) ([#44](https://github.com/sap/ui5-language-assistant/issues/44)) ([0991e6e](https://github.com/sap/ui5-language-assistant/commit/0991e6e4322b0b0fc374542c429931cc8552eb2b))
- properties and event names suggestions ([#14](https://github.com/sap/ui5-language-assistant/issues/14)) ([96db377](https://github.com/sap/ui5-language-assistant/commit/96db37770f094c7b5437098651a75f287fdb7858))
- **semantic-model:** implement semantic model for UI5 ([#12](https://github.com/sap/ui5-language-assistant/issues/12)) ([225361d](https://github.com/sap/ui5-language-assistant/commit/225361dfa3e1d9a7a5d84eb80c7cc9e7c04a1269))
- **xml-views-completion:** filter suggestions by visibility ([#28](https://github.com/sap/ui5-language-assistant/issues/28)) ([4ea75c5](https://github.com/sap/ui5-language-assistant/commit/4ea75c55c2f8ed44a3c0fb87fe29e0806543a070))
- logic utils ([#8](https://github.com/sap/ui5-language-assistant/issues/8)) ([7328217](https://github.com/sap/ui5-language-assistant/commit/7328217088e82994cd7ff548a89a4a3c48cf9a76))

### Reverts

- Revert "build: remove usage of TypeScript pre-processor for testing flows" ([83b73a2](https://github.com/sap/ui5-language-assistant/commit/83b73a2abe43be921873670f2c6bce75f9bd1685))
