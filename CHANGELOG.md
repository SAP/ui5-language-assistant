# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.1](https://github.com/SAP/ui5-language-assistant/compare/v3.0.0...v3.0.1) (2021-06-01)

**Note:** Version bump only for package root

# 3.0.0 (2021-06-01)

### Bug Fixes

- false positive for "extension-point" ([d6d9a1a](https://github.com/SAP/ui5-language-assistant/commit/d6d9a1aee4f0ed561f2e105ddb98dbc2a554d65f))
- logging level scope changed, `resource`--> `window` ([a47abd0](https://github.com/SAP/ui5-language-assistant/commit/a47abd00c72a16a7cce960ddce4ad0a400c4c236))
- **vscode-ext:** more specific fileMatch patterns for manifest.json schema ([#297](https://github.com/SAP/ui5-language-assistant/issues/297)) ([0eb9b6d](https://github.com/SAP/ui5-language-assistant/commit/0eb9b6d205b9a1d12cf5559e6b1299e708b5819f))
- **xml-views-validation:** Fragments in aggregations can cause a false positive ([#276](https://github.com/SAP/ui5-language-assistant/issues/276)) ([05600d7](https://github.com/SAP/ui5-language-assistant/commit/05600d7fe62e8ba4bd9c2a49c25e15b0da744b76)), closes [#274](https://github.com/SAP/ui5-language-assistant/issues/274)
- **xml-views-validation:** replace insensitive terms ([#320](https://github.com/SAP/ui5-language-assistant/issues/320)) ([8d6b726](https://github.com/SAP/ui5-language-assistant/commit/8d6b7268a0000c81e3d50ee0ebfde141b836d47f))
- check unknown namespaces according to the defined namespaces ([#122](https://github.com/SAP/ui5-language-assistant/issues/122)) ([11c733c](https://github.com/SAP/ui5-language-assistant/commit/11c733ca74c7b994cedfba2a54d398f803201dfa))
- don't allow to use classes from sub-namespace in tag ([#155](https://github.com/SAP/ui5-language-assistant/issues/155)) ([cb96c80](https://github.com/SAP/ui5-language-assistant/commit/cb96c80890f74f8d4ce90648ea6b1f2d915bfccc))
- don't offer classes from sub-namespaces in code completion ([#156](https://github.com/SAP/ui5-language-assistant/issues/156)) ([a6f4ec3](https://github.com/SAP/ui5-language-assistant/commit/a6f4ec37a9e496acd029aae43f7f82c65e7db8fa))
- don't show error for root core:FragmentDefinition tag ([#176](https://github.com/SAP/ui5-language-assistant/issues/176)) ([0520d39](https://github.com/SAP/ui5-language-assistant/commit/0520d399ba2c8d2799912ac44f50263326d60a0e))
- hover - add separator between title and documentation ([#142](https://github.com/SAP/ui5-language-assistant/issues/142)) ([4763d3f](https://github.com/SAP/ui5-language-assistant/commit/4763d3fe88d7d1bbe3e23f2a49fc5cb00ab66032))
- ignore unknown namespace message for whitelisted namespaces ([#234](https://github.com/SAP/ui5-language-assistant/issues/234)) ([bdcab7d](https://github.com/SAP/ui5-language-assistant/commit/bdcab7d3d984cf96819874c8f507a2898bc671d5))
- remove message for "sap.ui.vk.BaseNodeProxy" on library startup ([#130](https://github.com/SAP/ui5-language-assistant/issues/130)) ([eb5c6d3](https://github.com/SAP/ui5-language-assistant/commit/eb5c6d3a6da7a1580a199f214d4e855853095335))
- support namespace in aggregation name ([#150](https://github.com/SAP/ui5-language-assistant/issues/150)) ([cff718b](https://github.com/SAP/ui5-language-assistant/commit/cff718b4a2cfddc01cc5e44bd42eca68a8831832))
- tests of cardinality aggregation validation ([#154](https://github.com/SAP/ui5-language-assistant/issues/154)) ([76dec21](https://github.com/SAP/ui5-language-assistant/commit/76dec21dc668521ced4b1f4085d42819bb662049))
- use description first line without jsdoc tags in deprecation warning ([#141](https://github.com/SAP/ui5-language-assistant/issues/141)) ([9cf89eb](https://github.com/SAP/ui5-language-assistant/commit/9cf89ebda9dbf80c00b499e66cb44fabeb4d3553))
- use more accurate check for binding expression ([#123](https://github.com/SAP/ui5-language-assistant/issues/123)) ([b4ac8ae](https://github.com/SAP/ui5-language-assistant/commit/b4ac8ae44dd97bcdea2bf26ac55f888ffc817206))
- **language-server:** add namespace to class close tag name ([#25](https://github.com/SAP/ui5-language-assistant/issues/25)) ([96b15b5](https://github.com/SAP/ui5-language-assistant/commit/96b15b5b0a5ef5ce7201cf9b6c8975b16cfd6dec))
- **language-server:** don't print validation errors on startup ([#53](https://github.com/SAP/ui5-language-assistant/issues/53)) ([ae9c520](https://github.com/SAP/ui5-language-assistant/commit/ae9c52015590622952116e47173dff95ab30785d))
- **language-server:** namespace added at wrong position for closed tag ([#100](https://github.com/SAP/ui5-language-assistant/issues/100)) ([1b3c747](https://github.com/SAP/ui5-language-assistant/commit/1b3c747ff44a2932383bfb64d1bf44614d8ac3b7))
- **language-server:** suggest current attribute name ([#99](https://github.com/SAP/ui5-language-assistant/issues/99)) ([325e567](https://github.com/SAP/ui5-language-assistant/commit/325e567ec63a5acd46a9d9dc882d5a7bd665f3b8))
- use prefix when suggesting namespaces in attribute value ([#62](https://github.com/SAP/ui5-language-assistant/issues/62)) ([8019b4d](https://github.com/SAP/ui5-language-assistant/commit/8019b4d96401a8c476493f2db49c8a2cc596caf3))
- **language-server:** small fixes for theia ([#24](https://github.com/SAP/ui5-language-assistant/issues/24)) ([f6f01d4](https://github.com/SAP/ui5-language-assistant/commit/f6f01d4aba8712da5512baed1beb85b10935c3be))
- **logic-utils:** avoid infinite loops in getSuperClass() ([#8](https://github.com/SAP/ui5-language-assistant/issues/8)) ([45b769c](https://github.com/SAP/ui5-language-assistant/commit/45b769c13d651d2e77c6d401e776994515c1e1ea))
- **logic-utils:** take transitive interfaces into account in type… ([#6](https://github.com/SAP/ui5-language-assistant/issues/6)) ([846321b](https://github.com/SAP/ui5-language-assistant/commit/846321be0636aecabe57a044538d3e00540ea90c))
- **semantic-model:** workaround for api does not match impel issue ([#21](https://github.com/SAP/ui5-language-assistant/issues/21)) ([39eeeab](https://github.com/SAP/ui5-language-assistant/commit/39eeeabfac2012b7d5de0be39e9686535589f7ad))
- **vscode-ui5-language-assistant:** full schema v1.19 ([#49](https://github.com/SAP/ui5-language-assistant/issues/49)) ([b5592c3](https://github.com/SAP/ui5-language-assistant/commit/b5592c307a86d72408463868b218ef60989c2ff0))
- **vscode-ui5-language-support:** fix configuration name ([#15](https://github.com/SAP/ui5-language-assistant/issues/15)) ([ef6f4b3](https://github.com/SAP/ui5-language-assistant/commit/ef6f4b366c17d20be5482aeeb79276ae63c620bf))

### Features

- add enum value code assist ([#37](https://github.com/SAP/ui5-language-assistant/issues/37)) ([309c55c](https://github.com/SAP/ui5-language-assistant/commit/309c55c6047438d75e0b68c47d686cf2778f27b7))
- add settings to include deprecated and experimental APIs ([#143](https://github.com/SAP/ui5-language-assistant/issues/143)) ([fad2d9b](https://github.com/SAP/ui5-language-assistant/commit/fad2d9b0c998fa2a1f3d8d4cd7ba8e997d24d30b))
- add support for code completion of boolean properties values ([#66](https://github.com/SAP/ui5-language-assistant/issues/66)) ([d95ead4](https://github.com/SAP/ui5-language-assistant/commit/d95ead46697b6508785aa331c7594b0c20470582))
- add ui5 language server and client vscode extension ([18a6350](https://github.com/SAP/ui5-language-assistant/commit/18a635087de1846bb7f21e6dc4c3833e77dd8cfc))
- add validation for unknown namespace name in xmlns attribute value ([#103](https://github.com/SAP/ui5-language-assistant/issues/103)) ([f109686](https://github.com/SAP/ui5-language-assistant/commit/f1096861ec041372a349d7f17d755b0483aad1e6))
- associations suggestions ([#4](https://github.com/SAP/ui5-language-assistant/issues/4)) ([4b439bf](https://github.com/SAP/ui5-language-assistant/commit/4b439bfd628d564b9154aaa08624e9920a1a8360))
- deprecated aggregation tag validation ([#170](https://github.com/SAP/ui5-language-assistant/issues/170)) ([f9e492a](https://github.com/SAP/ui5-language-assistant/commit/f9e492aae72ff0230542901fedcb5c5f93b06a21))
- deprecated attribute validation ([#183](https://github.com/SAP/ui5-language-assistant/issues/183)) ([f2d2923](https://github.com/SAP/ui5-language-assistant/commit/f2d29237e633cf30454f7ecba03fed1e940e999f))
- implemented suggestions of namespaces keys ([#47](https://github.com/SAP/ui5-language-assistant/issues/47)) ([f4880ea](https://github.com/SAP/ui5-language-assistant/commit/f4880ea3f9105cac0d6d6a1606c18b9081893313))
- improve icons for namespaces, associations and aggregations ([#68](https://github.com/SAP/ui5-language-assistant/issues/68)) ([23bfbe2](https://github.com/SAP/ui5-language-assistant/commit/23bfbe22345bc558ddae28ca74de6b94fcc0aaa0))
- logging for language server ([#348](https://github.com/SAP/ui5-language-assistant/issues/348)) ([7e2c30a](https://github.com/SAP/ui5-language-assistant/commit/7e2c30a86cef9b239856dbef6df0f8785a210fc1))
- logic utils ([#8](https://github.com/SAP/ui5-language-assistant/issues/8)) ([7328217](https://github.com/SAP/ui5-language-assistant/commit/7328217088e82994cd7ff548a89a4a3c48cf9a76))
- manifest.json state management ([#224](https://github.com/SAP/ui5-language-assistant/issues/224)) ([da2682e](https://github.com/SAP/ui5-language-assistant/commit/da2682e474ff13d42ad913a6c7e57bb65d546f66))
- non stable id quick fix ([#266](https://github.com/SAP/ui5-language-assistant/issues/266)) ([c564db4](https://github.com/SAP/ui5-language-assistant/commit/c564db4ed7a5ec9e026be0f10a72c734a366c3f7))
- properties and event names suggestions ([#14](https://github.com/SAP/ui5-language-assistant/issues/14)) ([96db377](https://github.com/SAP/ui5-language-assistant/commit/96db37770f094c7b5437098651a75f287fdb7858))
- quick fix stable id for entire file ([#283](https://github.com/SAP/ui5-language-assistant/issues/283)) ([b3945da](https://github.com/SAP/ui5-language-assistant/commit/b3945da286479d0cca1955dba092cba44f4359fa))
- set schema configuration for manifest.json ([#192](https://github.com/SAP/ui5-language-assistant/issues/192)) ([7e7880a](https://github.com/SAP/ui5-language-assistant/commit/7e7880af58a52f59241b956faa77f757a310b95f))
- stable ID validation ([#231](https://github.com/SAP/ui5-language-assistant/issues/231)) ([65ddb60](https://github.com/SAP/ui5-language-assistant/commit/65ddb60844274beb309bfb1c32a3698ec3ec15c4))
- suggest UI5 namespaces in xmlns attributes values ([#17](https://github.com/SAP/ui5-language-assistant/issues/17)) ([46c84c4](https://github.com/SAP/ui5-language-assistant/commit/46c84c4c5e2030fea255895a06cecbb5828fe31b))
- support SAP UI5 Distribution libraries version 1.71.14 ([#39](https://github.com/SAP/ui5-language-assistant/issues/39)) ([7589a8b](https://github.com/SAP/ui5-language-assistant/commit/7589a8bb97a2cf387b66583229c12f3fa971c28e))
- tooltip on hover ([#119](https://github.com/SAP/ui5-language-assistant/issues/119)) ([e3bf89d](https://github.com/SAP/ui5-language-assistant/commit/e3bf89d8889eac8ed8f6420a3cb744abbe44f6b2))
- type aggregation validation ([#164](https://github.com/SAP/ui5-language-assistant/issues/164)) ([63c5b5a](https://github.com/SAP/ui5-language-assistant/commit/63c5b5a9ddcd10a5557b7b69c94371f2bebab7f6))
- use github.com/sap/ui5-manifest schema ([#218](https://github.com/SAP/ui5-language-assistant/issues/218)) ([ee8eef0](https://github.com/SAP/ui5-language-assistant/commit/ee8eef061f73ffac18ec9dee8dc119c11761e17b))
- validate attribute key is known in class and aggregation tags ([#120](https://github.com/SAP/ui5-language-assistant/issues/120)) ([443e13b](https://github.com/SAP/ui5-language-assistant/commit/443e13b55b22d982391f1d3972ea97f350d472a9))
- validate boolean value in property ([#113](https://github.com/SAP/ui5-language-assistant/issues/113)) ([59d3a69](https://github.com/SAP/ui5-language-assistant/commit/59d3a699c7557bc25adfbf19091981813bade4b0))
- validate tag name is known ([#129](https://github.com/SAP/ui5-language-assistant/issues/129)) ([eaf494c](https://github.com/SAP/ui5-language-assistant/commit/eaf494c5278d8c1200925a01daabcde9942f8dbc))
- validation for cardinality aggregation ([#149](https://github.com/SAP/ui5-language-assistant/issues/149)) ([7e8c01a](https://github.com/SAP/ui5-language-assistant/commit/7e8c01a773584b34505b70fded387520ae1bb798))
- validation for none unique IDs ([#121](https://github.com/SAP/ui5-language-assistant/issues/121)) ([a207f27](https://github.com/SAP/ui5-language-assistant/commit/a207f2791c42b654fff5e82a9c51857a3b875bcf))
- **language-server:** add default value for property attribute ([#70](https://github.com/SAP/ui5-language-assistant/issues/70)) ([43c5c77](https://github.com/SAP/ui5-language-assistant/commit/43c5c77fd69b44b728a6dfe9451cad0f186e2073))
- **language-server:** allow to replace FQN on code assist ([#59](https://github.com/SAP/ui5-language-assistant/issues/59)) ([abb21f1](https://github.com/SAP/ui5-language-assistant/commit/abb21f1820d0babc6df86b01dde16eb1e956dbe9))
- **language-server:** auto-insert namespace in tag name for class ([#18](https://github.com/SAP/ui5-language-assistant/issues/18)) ([2aa70fe](https://github.com/SAP/ui5-language-assistant/commit/2aa70fe372567530a69a7dbf5e472a63d551c696))
- **language-server:** auto-insert namespace when selecting class ([#63](https://github.com/SAP/ui5-language-assistant/issues/63)) ([20b590f](https://github.com/SAP/ui5-language-assistant/commit/20b590f04036aeeb4e789a1c896f336485b3c543))
- **language-server:** auto-replace closing tag name ([#65](https://github.com/SAP/ui5-language-assistant/issues/65)) ([5db20c1](https://github.com/SAP/ui5-language-assistant/commit/5db20c1fbdb2d569e1b1961ffd89f38381d1d4ef))
- **language-server:** completion response improvements ([#16](https://github.com/SAP/ui5-language-assistant/issues/16)) ([a17904e](https://github.com/SAP/ui5-language-assistant/commit/a17904eac77ebc9087056a9808ab8449ad2dc38c))
- **language-server:** expose xml-view-validations as LSP diagnostics ([#72](https://github.com/SAP/ui5-language-assistant/issues/72)) ([e347699](https://github.com/SAP/ui5-language-assistant/commit/e3476992864a83b68172b4f60287e12619aadddf))
- **semantic-model:** add experimental information ([#56](https://github.com/SAP/ui5-language-assistant/issues/56)) ([f55098d](https://github.com/SAP/ui5-language-assistant/commit/f55098dc7fc949395efef04335667a0bc55e9d8e))
- **semantic-model:** fix properties and add fields on class, improve type system ([#25](https://github.com/SAP/ui5-language-assistant/issues/25)) ([55d392e](https://github.com/SAP/ui5-language-assistant/commit/55d392ed01dfc7d40b6ae57bb9ae92464dffee95))
- **semantic-model:** implement semantic model for UI5 ([#12](https://github.com/SAP/ui5-language-assistant/issues/12)) ([225361d](https://github.com/SAP/ui5-language-assistant/commit/225361dfa3e1d9a7a5d84eb80c7cc9e7c04a1269))
- **semantic-model:** return frozen model ([#22](https://github.com/SAP/ui5-language-assistant/issues/22)) ([12a3041](https://github.com/SAP/ui5-language-assistant/commit/12a30411c103f28d47ea79a25f10ce94dea5ec06))
- **semantic-model:** set content as View default aggregation ([#125](https://github.com/SAP/ui5-language-assistant/issues/125)) ([6d34f3e](https://github.com/SAP/ui5-language-assistant/commit/6d34f3e6438ab322aad450c7231a73876231f1ea))
- **semantic-model:** support special attributes - xml completion ([#55](https://github.com/SAP/ui5-language-assistant/issues/55)) ([5ae0c3a](https://github.com/SAP/ui5-language-assistant/commit/5ae0c3a818c6630de4503fc2551e568b6f3ce399))
- **xml-views-completion:** aggregations auto-complete ([#4](https://github.com/SAP/ui5-language-assistant/issues/4)) ([20caf48](https://github.com/SAP/ui5-language-assistant/commit/20caf48ba4669f15df6778988c2ba63a45aa9599))
- **xml-views-completion:** classes suggestions ([#50](https://github.com/SAP/ui5-language-assistant/issues/50)) ([42a62b6](https://github.com/SAP/ui5-language-assistant/commit/42a62b64d73862b5f4fe34b803964ffe98431f38))
- **xml-views-completion:** do not suggest abstract classes in XM… ([#44](https://github.com/SAP/ui5-language-assistant/issues/44)) ([cd0f38f](https://github.com/SAP/ui5-language-assistant/commit/cd0f38f683e56c2cd19ee9adee9f21bc22bd0a0c))
- **xml-views-completion:** filter on sap.ui.core.Element (not Control) ([#44](https://github.com/SAP/ui5-language-assistant/issues/44)) ([0991e6e](https://github.com/SAP/ui5-language-assistant/commit/0991e6e4322b0b0fc374542c429931cc8552eb2b))
- **xml-views-completion:** filter suggestions by visibility ([#28](https://github.com/SAP/ui5-language-assistant/issues/28)) ([4ea75c5](https://github.com/SAP/ui5-language-assistant/commit/4ea75c55c2f8ed44a3c0fb87fe29e0806543a070))
- **xml-views-completion:** suggest namespaces on non-class elements ([#52](https://github.com/SAP/ui5-language-assistant/issues/52)) ([e651847](https://github.com/SAP/ui5-language-assistant/commit/e651847587c9fb663b2c98e73179ed7e1999cf18))
- **xml-views-validation:** skeleton ([#67](https://github.com/SAP/ui5-language-assistant/issues/67)) ([e4b79ce](https://github.com/SAP/ui5-language-assistant/commit/e4b79ce04869214c842a2d6a373b6a09c2e5ab22))

### Performance Improvements

- **language-server:** cache downloaded resources ([#50](https://github.com/SAP/ui5-language-assistant/issues/50)) ([de8d7d5](https://github.com/SAP/ui5-language-assistant/commit/de8d7d5e38c76666cc2590a885127b202096f289))

### Reverts

- remove Theia manifet.json via settings.json workaround ([#220](https://github.com/SAP/ui5-language-assistant/issues/220)) ([4ca8eb9](https://github.com/SAP/ui5-language-assistant/commit/4ca8eb92c509a78ccc1f6ea9acac76cccdbc4fee))
- Revert "build: remove usage of TypeScript pre-processor for testing flows" ([83b73a2](https://github.com/SAP/ui5-language-assistant/commit/83b73a2abe43be921873670f2c6bce75f9bd1685))

### BREAKING CHANGES

- - computeQuickFixStableIdInfo function signature has changed.

* validateXMLView no longer accepts `flexEnabled` optional argument and always requires passing a `UI5ValidatorsConfig`
