# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.4](https://github.com/sap/ui5-language-assistant/compare/v4.0.3...v4.0.4) (2023-02-16)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-validation

## [4.0.3](https://github.com/sap/ui5-language-assistant/compare/v4.0.2...v4.0.3) (2023-01-30)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-validation

## [4.0.2](https://github.com/sap/ui5-language-assistant/compare/v4.0.1...v4.0.2) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-validation

## [4.0.1](https://github.com/sap/ui5-language-assistant/compare/v4.0.0...v4.0.1) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-validation

# [4.0.0](https://github.com/sap/ui5-language-assistant/compare/v3.3.1...v4.0.0) (2023-01-26)

### Features

- annotation relevant lsp package ([#535](https://github.com/sap/ui5-language-assistant/issues/535)) ([6b35d43](https://github.com/sap/ui5-language-assistant/commit/6b35d43e91753eef6bcd215d894ce69472b77863))
- introduce context package ([#523](https://github.com/sap/ui5-language-assistant/issues/523)) ([ce59328](https://github.com/sap/ui5-language-assistant/commit/ce59328b229cd55a2b2e606afd50785feffab5a5))

### BREAKING CHANGES

- introduce context by pr #523

Co-authored-by: Klaus Keller <klaus.keller@sap.com>

## [3.3.1](https://github.com/sap/ui5-language-assistant/compare/v3.3.0...v3.3.1) (2022-09-01)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-validation

# [3.3.0](https://github.com/sap/ui5-language-assistant/compare/v3.2.1...v3.3.0) (2022-08-24)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-validation

## [3.2.1](https://github.com/sap/ui5-language-assistant/compare/v3.2.0...v3.2.1) (2022-08-20)

### Bug Fixes

- **language-server:** detect the UI5 version from closest manifest.json ([#472](https://github.com/sap/ui5-language-assistant/issues/472)) ([39c2728](https://github.com/sap/ui5-language-assistant/commit/39c2728809e02ac57e624c4b8e02a046d5f67b2d))

# [3.2.0](https://github.com/sap/ui5-language-assistant/compare/v3.1.0...v3.2.0) (2022-08-15)

### Features

- multi-version support for UI5 XMLView code completion ([#469](https://github.com/sap/ui5-language-assistant/issues/469)) ([6cca109](https://github.com/sap/ui5-language-assistant/commit/6cca1092e01fbb77fdc510d039f0ce94529b2a9e)), closes [#468](https://github.com/sap/ui5-language-assistant/issues/468)

## [3.0.1](https://github.com/sap/ui5-language-assistant/compare/v3.0.0...v3.0.1) (2021-06-01)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-validation

# 3.0.0 (2021-06-01)

### Bug Fixes

- false positive for "extension-point" ([d6d9a1a](https://github.com/sap/ui5-language-assistant/commit/d6d9a1aee4f0ed561f2e105ddb98dbc2a554d65f))
- **xml-views-validation:** Fragments in aggregations can cause a false positive ([#276](https://github.com/sap/ui5-language-assistant/issues/276)) ([05600d7](https://github.com/sap/ui5-language-assistant/commit/05600d7fe62e8ba4bd9c2a49c25e15b0da744b76)), closes [#274](https://github.com/sap/ui5-language-assistant/issues/274)
- **xml-views-validation:** replace insensitive terms ([#320](https://github.com/sap/ui5-language-assistant/issues/320)) ([8d6b726](https://github.com/sap/ui5-language-assistant/commit/8d6b7268a0000c81e3d50ee0ebfde141b836d47f))
- check unknown namespaces according to the defined namespaces ([#122](https://github.com/sap/ui5-language-assistant/issues/122)) ([11c733c](https://github.com/sap/ui5-language-assistant/commit/11c733ca74c7b994cedfba2a54d398f803201dfa))
- don't show error for root core:FragmentDefinition tag ([#176](https://github.com/sap/ui5-language-assistant/issues/176)) ([0520d39](https://github.com/sap/ui5-language-assistant/commit/0520d399ba2c8d2799912ac44f50263326d60a0e))
- ignore unknown namespace message for whitelisted namespaces ([#234](https://github.com/sap/ui5-language-assistant/issues/234)) ([bdcab7d](https://github.com/sap/ui5-language-assistant/commit/bdcab7d3d984cf96819874c8f507a2898bc671d5))
- support namespace in aggregation name ([#150](https://github.com/sap/ui5-language-assistant/issues/150)) ([cff718b](https://github.com/sap/ui5-language-assistant/commit/cff718b4a2cfddc01cc5e44bd42eca68a8831832))
- tests of cardinality aggregation validation ([#154](https://github.com/sap/ui5-language-assistant/issues/154)) ([76dec21](https://github.com/sap/ui5-language-assistant/commit/76dec21dc668521ced4b1f4085d42819bb662049))
- use description first line without jsdoc tags in deprecation warning ([#141](https://github.com/sap/ui5-language-assistant/issues/141)) ([9cf89eb](https://github.com/sap/ui5-language-assistant/commit/9cf89ebda9dbf80c00b499e66cb44fabeb4d3553))
- use more accurate check for binding expression ([#123](https://github.com/sap/ui5-language-assistant/issues/123)) ([b4ac8ae](https://github.com/sap/ui5-language-assistant/commit/b4ac8ae44dd97bcdea2bf26ac55f888ffc817206))

### Features

- add settings to include deprecated and experimental APIs ([#143](https://github.com/sap/ui5-language-assistant/issues/143)) ([fad2d9b](https://github.com/sap/ui5-language-assistant/commit/fad2d9b0c998fa2a1f3d8d4cd7ba8e997d24d30b))
- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/sap/ui5-language-assistant/issues/103)) ([f109686](https://github.com/sap/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))
- deprecated aggregation tag validation ([#170](https://github.com/sap/ui5-language-assistant/issues/170)) ([f9e492a](https://github.com/sap/ui5-language-assistant/commit/f9e492aae72ff0230542901fedcb5c5f93b06a21))
- deprecated attribute validation ([#183](https://github.com/sap/ui5-language-assistant/issues/183)) ([f2d2923](https://github.com/sap/ui5-language-assistant/commit/f2d29237e633cf30454f7ecba03fed1e940e999f))
- non stable id quick fix ([#266](https://github.com/sap/ui5-language-assistant/issues/266)) ([c564db4](https://github.com/sap/ui5-language-assistant/commit/c564db4ed7a5ec9e026be0f10a72c734a366c3f7))
- quick fix stable id for entire file ([#283](https://github.com/sap/ui5-language-assistant/issues/283)) ([b3945da](https://github.com/sap/ui5-language-assistant/commit/b3945da286479d0cca1955dba092cba44f4359fa))
- stable ID validation ([#231](https://github.com/sap/ui5-language-assistant/issues/231)) ([65ddb60](https://github.com/sap/ui5-language-assistant/commit/65ddb60844274beb309bfb1c32a3698ec3ec15c4))
- type aggregation validation ([#164](https://github.com/sap/ui5-language-assistant/issues/164)) ([63c5b5a](https://github.com/sap/ui5-language-assistant/commit/63c5b5a9ddcd10a5557b7b69c94371f2bebab7f6))
- validate attribute key is known in class and aggregation tags ([#120](https://github.com/sap/ui5-language-assistant/issues/120)) ([443e13b](https://github.com/sap/ui5-language-assistant/commit/443e13b55b22d982391f1d3972ea97f350d472a9))
- validate boolean value in property ([#113](https://github.com/sap/ui5-language-assistant/issues/113)) ([59d3a69](https://github.com/sap/ui5-language-assistant/commit/59d3a699c7557bc25adfbf19091981813bade4b0))
- validate tag name is known ([#129](https://github.com/sap/ui5-language-assistant/issues/129)) ([eaf494c](https://github.com/sap/ui5-language-assistant/commit/eaf494c5278d8c1200925a01daabcde9942f8dbc))
- validation for cardinality aggregation ([#149](https://github.com/sap/ui5-language-assistant/issues/149)) ([7e8c01a](https://github.com/sap/ui5-language-assistant/commit/7e8c01a773584b34505b70fded387520ae1bb798))
- validation for none unique IDs ([#121](https://github.com/sap/ui5-language-assistant/issues/121)) ([a207f27](https://github.com/sap/ui5-language-assistant/commit/a207f2791c42b654fff5e82a9c51857a3b875bcf))
- **language-server:** expose xml-view-validations as LSP diagnostics ([#72](https://github.com/sap/ui5-language-assistant/issues/72)) ([e347699](https://github.com/sap/ui5-language-assistant/commit/e3476992864a83b68172b4f60287e12619aadddf))
- **xml-views-validation:** skeleton ([#67](https://github.com/sap/ui5-language-assistant/issues/67)) ([e4b79ce](https://github.com/sap/ui5-language-assistant/commit/e4b79ce04869214c842a2d6a373b6a09c2e5ab22))

### BREAKING CHANGES

- - computeQuickFixStableIdInfo function signature has changed.

* validateXMLView no longer accepts `flexEnabled` optional argument and always requires passing a `UI5ValidatorsConfig`

## [2.0.4](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-validation@2.0.3...@ui5-language-assistant/xml-views-validation@2.0.4) (2021-05-04)

### Bug Fixes

- false positive for "extension-point" ([d6d9a1a](https://github.com/sap/ui5-language-assistant/commit/d6d9a1aee4f0ed561f2e105ddb98dbc2a554d65f))

## [2.0.3](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-validation@2.0.2...@ui5-language-assistant/xml-views-validation@2.0.3) (2021-01-03)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-validation

## [2.0.2](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-validation@2.0.1...@ui5-language-assistant/xml-views-validation@2.0.2) (2020-12-30)

### Bug Fixes

- **xml-views-validation:** replace insensitive terms ([#320](https://github.com/sap/ui5-language-assistant/issues/320)) ([8d6b726](https://github.com/sap/ui5-language-assistant/commit/8d6b7268a0000c81e3d50ee0ebfde141b836d47f))

## [2.0.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-validation@2.0.0...@ui5-language-assistant/xml-views-validation@2.0.1) (2020-08-27)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-validation

# [2.0.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-validation@0.6.0...@ui5-language-assistant/xml-views-validation@2.0.0) (2020-08-12)

### Bug Fixes

- **xml-views-validation:** Fragments in aggregations can cause a false positive ([#276](https://github.com/sap/ui5-language-assistant/issues/276)) ([05600d7](https://github.com/sap/ui5-language-assistant/commit/05600d7fe62e8ba4bd9c2a49c25e15b0da744b76)), closes [#274](https://github.com/sap/ui5-language-assistant/issues/274)

### Features

- non stable id quick fix ([#266](https://github.com/sap/ui5-language-assistant/issues/266)) ([c564db4](https://github.com/sap/ui5-language-assistant/commit/c564db4ed7a5ec9e026be0f10a72c734a366c3f7))
- quick fix stable id for entire file ([#283](https://github.com/sap/ui5-language-assistant/issues/283)) ([b3945da](https://github.com/sap/ui5-language-assistant/commit/b3945da286479d0cca1955dba092cba44f4359fa))

### BREAKING CHANGES

- - computeQuickFixStableIdInfo function signature has changed.

* validateXMLView no longer accepts `flexEnabled` optional argument and always requires passing a `UI5ValidatorsConfig`

# [0.6.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-validation@0.5.2...@ui5-language-assistant/xml-views-validation@0.6.0) (2020-07-15)

### Bug Fixes

- ignore unknown namespace message for whitelisted namespaces ([#234](https://github.com/sap/ui5-language-assistant/issues/234)) ([bdcab7d](https://github.com/sap/ui5-language-assistant/commit/bdcab7d3d984cf96819874c8f507a2898bc671d5))

### Features

- stable ID validation ([#231](https://github.com/sap/ui5-language-assistant/issues/231)) ([65ddb60](https://github.com/sap/ui5-language-assistant/commit/65ddb60844274beb309bfb1c32a3698ec3ec15c4))

## [0.5.2](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-validation@0.5.1...@ui5-language-assistant/xml-views-validation@0.5.2) (2020-07-08)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-validation

## [0.5.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-validation@0.5.0...@ui5-language-assistant/xml-views-validation@0.5.1) (2020-06-29)

**Note:** Version bump only for package @ui5-language-assistant/xml-views-validation

# [0.5.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-validation@0.4.0...@ui5-language-assistant/xml-views-validation@0.5.0) (2020-06-17)

### Bug Fixes

- don't show error for root core:FragmentDefinition tag ([#176](https://github.com/sap/ui5-language-assistant/issues/176)) ([0520d39](https://github.com/sap/ui5-language-assistant/commit/0520d399ba2c8d2799912ac44f50263326d60a0e))

### Features

- add settings to include deprecated and experimental APIs ([#143](https://github.com/sap/ui5-language-assistant/issues/143)) ([fad2d9b](https://github.com/sap/ui5-language-assistant/commit/fad2d9b0c998fa2a1f3d8d4cd7ba8e997d24d30b))
- deprecated aggregation tag validation ([#170](https://github.com/sap/ui5-language-assistant/issues/170)) ([f9e492a](https://github.com/sap/ui5-language-assistant/commit/f9e492aae72ff0230542901fedcb5c5f93b06a21))
- deprecated attribute validation ([#183](https://github.com/sap/ui5-language-assistant/issues/183)) ([f2d2923](https://github.com/sap/ui5-language-assistant/commit/f2d29237e633cf30454f7ecba03fed1e940e999f))
- type aggregation validation ([#164](https://github.com/sap/ui5-language-assistant/issues/164)) ([63c5b5a](https://github.com/sap/ui5-language-assistant/commit/63c5b5a9ddcd10a5557b7b69c94371f2bebab7f6))

# [0.4.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-validation@0.3.0...@ui5-language-assistant/xml-views-validation@0.4.0) (2020-06-03)

### Bug Fixes

- support namespace in aggregation name ([#150](https://github.com/sap/ui5-language-assistant/issues/150)) ([cff718b](https://github.com/sap/ui5-language-assistant/commit/cff718b4a2cfddc01cc5e44bd42eca68a8831832))
- tests of cardinality aggregation validation ([#154](https://github.com/sap/ui5-language-assistant/issues/154)) ([76dec21](https://github.com/sap/ui5-language-assistant/commit/76dec21dc668521ced4b1f4085d42819bb662049))
- use description first line without jsdoc tags in deprecation warning ([#141](https://github.com/sap/ui5-language-assistant/issues/141)) ([9cf89eb](https://github.com/sap/ui5-language-assistant/commit/9cf89ebda9dbf80c00b499e66cb44fabeb4d3553))

### Features

- validation for cardinality aggregation ([#149](https://github.com/sap/ui5-language-assistant/issues/149)) ([7e8c01a](https://github.com/sap/ui5-language-assistant/commit/7e8c01a773584b34505b70fded387520ae1bb798))
- validation for none unique IDs ([#121](https://github.com/sap/ui5-language-assistant/issues/121)) ([a207f27](https://github.com/sap/ui5-language-assistant/commit/a207f2791c42b654fff5e82a9c51857a3b875bcf))

# [0.3.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/xml-views-validation@0.2.0...@ui5-language-assistant/xml-views-validation@0.3.0) (2020-05-20)

### Bug Fixes

- check unknown namespaces according to the defined namespaces ([#122](https://github.com/sap/ui5-language-assistant/issues/122)) ([11c733c](https://github.com/sap/ui5-language-assistant/commit/11c733ca74c7b994cedfba2a54d398f803201dfa))
- use more accurate check for binding expression ([#123](https://github.com/sap/ui5-language-assistant/issues/123)) ([b4ac8ae](https://github.com/sap/ui5-language-assistant/commit/b4ac8ae44dd97bcdea2bf26ac55f888ffc817206))

### Features

- **language-server:** expose xml-view-validations as LSP diagnostics ([#72](https://github.com/sap/ui5-language-assistant/issues/72)) ([e347699](https://github.com/sap/ui5-language-assistant/commit/e3476992864a83b68172b4f60287e12619aadddf))
- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/sap/ui5-language-assistant/issues/103)) ([f109686](https://github.com/sap/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))
- validate attribute key is known in class and aggregation tags ([#120](https://github.com/sap/ui5-language-assistant/issues/120)) ([443e13b](https://github.com/sap/ui5-language-assistant/commit/443e13b55b22d982391f1d3972ea97f350d472a9))
- validate boolean value in property ([#113](https://github.com/sap/ui5-language-assistant/issues/113)) ([59d3a69](https://github.com/sap/ui5-language-assistant/commit/59d3a699c7557bc25adfbf19091981813bade4b0))
- validate tag name is known ([#129](https://github.com/sap/ui5-language-assistant/issues/129)) ([eaf494c](https://github.com/sap/ui5-language-assistant/commit/eaf494c5278d8c1200925a01daabcde9942f8dbc))

# 0.2.0 (2020-05-06)

### Features

- **xml-views-validation:** skeleton ([#67](https://github.com/sap/ui5-language-assistant/issues/67)) ([e4b79ce](https://github.com/sap/ui5-language-assistant/commit/e4b79ce04869214c842a2d6a373b6a09c2e5ab22))
