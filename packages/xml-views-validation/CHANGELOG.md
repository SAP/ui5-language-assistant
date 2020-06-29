# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
