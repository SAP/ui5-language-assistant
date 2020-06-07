# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.7.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/language-server@1.6.0...@ui5-language-assistant/language-server@1.7.0) (2020-06-03)

### Bug Fixes

- hover - add separator between title and documentation ([#142](https://github.com/sap/ui5-language-assistant/issues/142)) ([4763d3f](https://github.com/sap/ui5-language-assistant/commit/4763d3fe88d7d1bbe3e23f2a49fc5cb00ab66032))
- support namespace in aggregation name ([#150](https://github.com/sap/ui5-language-assistant/issues/150)) ([cff718b](https://github.com/sap/ui5-language-assistant/commit/cff718b4a2cfddc01cc5e44bd42eca68a8831832))
- tests of cardinality aggregation validation ([#154](https://github.com/sap/ui5-language-assistant/issues/154)) ([76dec21](https://github.com/sap/ui5-language-assistant/commit/76dec21dc668521ced4b1f4085d42819bb662049))
- use description first line without jsdoc tags in deprecation warning ([#141](https://github.com/sap/ui5-language-assistant/issues/141)) ([9cf89eb](https://github.com/sap/ui5-language-assistant/commit/9cf89ebda9dbf80c00b499e66cb44fabeb4d3553))

### Features

- validation for cardinality aggregation ([#149](https://github.com/sap/ui5-language-assistant/issues/149)) ([7e8c01a](https://github.com/sap/ui5-language-assistant/commit/7e8c01a773584b34505b70fded387520ae1bb798))
- validation for none unique IDs ([#121](https://github.com/sap/ui5-language-assistant/issues/121)) ([a207f27](https://github.com/sap/ui5-language-assistant/commit/a207f2791c42b654fff5e82a9c51857a3b875bcf))

# [1.6.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/language-server@1.5.1...@ui5-language-assistant/language-server@1.6.0) (2020-05-20)

### Features

- tooltip on hover ([#119](https://github.com/sap/ui5-language-assistant/issues/119)) ([e3bf89d](https://github.com/sap/ui5-language-assistant/commit/e3bf89d8889eac8ed8f6420a3cb744abbe44f6b2))

## [1.5.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/language-server@1.5.0...@ui5-language-assistant/language-server@1.5.1) (2020-05-20)

**Note:** Version bump only for package @ui5-language-assistant/language-server

# [1.5.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/language-server@1.4.0...@ui5-language-assistant/language-server@1.5.0) (2020-05-20)

### Bug Fixes

- **language-server:** namespace added at wrong position for closed tag ([#100](https://github.com/sap/ui5-language-assistant/issues/100)) ([1b3c747](https://github.com/sap/ui5-language-assistant/commit/1b3c747ff44a2932383bfb64d1bf44614d8ac3b7))

### Features

- **language-server:** expose xml-view-validations as LSP diagnostics ([#72](https://github.com/sap/ui5-language-assistant/issues/72)) ([e347699](https://github.com/sap/ui5-language-assistant/commit/e3476992864a83b68172b4f60287e12619aadddf))
- add support for code completion of boolean properties values ([#66](https://github.com/sap/ui5-language-assistant/issues/66)) ([d95ead4](https://github.com/sap/ui5-language-assistant/commit/d95ead46697b6508785aa331c7594b0c20470582))
- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/sap/ui5-language-assistant/issues/103)) ([f109686](https://github.com/sap/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))
- validate attribute key is known in class and aggregation tags ([#120](https://github.com/sap/ui5-language-assistant/issues/120)) ([443e13b](https://github.com/sap/ui5-language-assistant/commit/443e13b55b22d982391f1d3972ea97f350d472a9))
- validate boolean value in property ([#113](https://github.com/sap/ui5-language-assistant/issues/113)) ([59d3a69](https://github.com/sap/ui5-language-assistant/commit/59d3a699c7557bc25adfbf19091981813bade4b0))
- validate tag name is known ([#129](https://github.com/sap/ui5-language-assistant/issues/129)) ([eaf494c](https://github.com/sap/ui5-language-assistant/commit/eaf494c5278d8c1200925a01daabcde9942f8dbc))

# [1.4.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/language-server@1.3.0...@ui5-language-assistant/language-server@1.4.0) (2020-05-06)

### Bug Fixes

- use prefix when suggesting namespaces in attribute value ([#62](https://github.com/sap/ui5-language-assistant/issues/62)) ([8019b4d](https://github.com/sap/ui5-language-assistant/commit/8019b4d96401a8c476493f2db49c8a2cc596caf3))

### Features

- improve icons for namespaces, associations and aggregations ([#68](https://github.com/sap/ui5-language-assistant/issues/68)) ([23bfbe2](https://github.com/sap/ui5-language-assistant/commit/23bfbe22345bc558ddae28ca74de6b94fcc0aaa0))
- **language-server:** add default value for property attribute ([#70](https://github.com/sap/ui5-language-assistant/issues/70)) ([43c5c77](https://github.com/sap/ui5-language-assistant/commit/43c5c77fd69b44b728a6dfe9451cad0f186e2073))
- **language-server:** allow to replace FQN on code assist ([#59](https://github.com/sap/ui5-language-assistant/issues/59)) ([abb21f1](https://github.com/sap/ui5-language-assistant/commit/abb21f1820d0babc6df86b01dde16eb1e956dbe9))
- **language-server:** auto-insert namespace when selecting class ([#63](https://github.com/sap/ui5-language-assistant/issues/63)) ([20b590f](https://github.com/sap/ui5-language-assistant/commit/20b590f04036aeeb4e789a1c896f336485b3c543))
- **language-server:** auto-replace closing tag name ([#65](https://github.com/sap/ui5-language-assistant/issues/65)) ([5db20c1](https://github.com/sap/ui5-language-assistant/commit/5db20c1fbdb2d569e1b1961ffd89f38381d1d4ef))

# [1.3.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/language-server@1.2.1...@ui5-language-assistant/language-server@1.3.0) (2020-04-23)

### Features

- **semantic-model:** add experimental information ([#56](https://github.com/sap/ui5-language-assistant/issues/56)) ([f55098d](https://github.com/sap/ui5-language-assistant/commit/f55098dc7fc949395efef04335667a0bc55e9d8e))

## [1.2.1](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/language-server@1.2.0...@ui5-language-assistant/language-server@1.2.1) (2020-04-07)

### Bug Fixes

- **language-server:** don't print validation errors on startup ([#53](https://github.com/sap/ui5-language-assistant/issues/53)) ([ae9c520](https://github.com/sap/ui5-language-assistant/commit/ae9c52015590622952116e47173dff95ab30785d))

# [1.2.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/language-server@1.1.0...@ui5-language-assistant/language-server@1.2.0) (2020-04-07)

### Features

- support SAPUI5 Distribution libraries version 1.71.14 ([#39](https://github.com/sap/ui5-language-assistant/issues/39)) ([7589a8b](https://github.com/sap/ui5-language-assistant/commit/7589a8bb97a2cf387b66583229c12f3fa971c28e))

### Performance Improvements

- **language-server:** cache downloaded resources ([#50](https://github.com/sap/ui5-language-assistant/issues/50)) ([de8d7d5](https://github.com/sap/ui5-language-assistant/commit/de8d7d5e38c76666cc2590a885127b202096f289))

# [1.1.0](https://github.com/sap/ui5-language-assistant/compare/@ui5-language-assistant/language-server@1.0.0...@ui5-language-assistant/language-server@1.1.0) (2020-04-01)

### Features

- suggest UI5 namespaces in xmlns attributes values ([#17](https://github.com/sap/ui5-language-assistant/issues/17)) ([46c84c4](https://github.com/sap/ui5-language-assistant/commit/46c84c4c5e2030fea255895a06cecbb5828fe31b))

# 1.0.0 (2020-03-31)

### Bug Fixes

- **language-server:** add namespace to class close tag name ([#25](https://github.com/sap/ui5-language-assistant/issues/25)) ([96b15b5](https://github.com/sap/ui5-language-assistant/commit/96b15b5b0a5ef5ce7201cf9b6c8975b16cfd6dec))
- **language-server:** small fixes for theia ([#24](https://github.com/sap/ui5-language-assistant/issues/24)) ([f6f01d4](https://github.com/sap/ui5-language-assistant/commit/f6f01d4aba8712da5512baed1beb85b10935c3be))

### Features

- **language-server:** auto-insert namespace in tag name for class ([#18](https://github.com/sap/ui5-language-assistant/issues/18)) ([2aa70fe](https://github.com/sap/ui5-language-assistant/commit/2aa70fe372567530a69a7dbf5e472a63d551c696))
- **language-server:** completion response improvements ([#16](https://github.com/sap/ui5-language-assistant/issues/16)) ([a17904e](https://github.com/sap/ui5-language-assistant/commit/a17904eac77ebc9087056a9808ab8449ad2dc38c))
- add ui5 language server and client vscode extension ([18a6350](https://github.com/sap/ui5-language-assistant/commit/18a635087de1846bb7f21e6dc4c3833e77dd8cfc))
