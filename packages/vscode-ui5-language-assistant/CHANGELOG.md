# Change Log

## 4.0.31

### Patch Changes

- 42ad255: No completion items for empty file
- Updated dependencies [42ad255]
  - @ui5-language-assistant/language-server@4.0.23

## 4.0.30

### Patch Changes

- 9df89eb: Use json api
  - @ui5-language-assistant/language-server@4.0.22

## 4.0.29

### Patch Changes

- e1f4344: chore: add local web server guide

## 4.0.28

### Patch Changes

- 38b9004: Fix: Cannot assign to read only property 'document' of object
- Updated dependencies [38b9004]
  - @ui5-language-assistant/language-server@4.0.21

## 4.0.27

### Patch Changes

- 42362d8: Lerna version bump to fix deployment to npm repo

## 4.0.26

### Patch Changes

- 62251ca: Manual test cases added for annotation related LSP
- 05d9f69: No code completion for wrong position
  - @ui5-language-assistant/language-server@4.0.20

## 4.0.25

### Patch Changes

- 255c0e5: fix: remove choice from completion items
  - @ui5-language-assistant/language-server@4.0.19

## 4.0.24

### Patch Changes

- 4dcd0c0: Address some issues
  - @ui5-language-assistant/language-server@4.0.18

## 4.0.23

### Patch Changes

- b130f9f: Fix tab stop
  - @ui5-language-assistant/language-server@4.0.17

## 4.0.22

### Patch Changes

- fad2b51: Sonar Cloud analysis improvement, switch from automatic to CI sonar scan
- Updated dependencies [fad2b51]
  - @ui5-language-assistant/language-server@4.0.16

## 4.0.21

### Patch Changes

- f670b06: Semantic model is adapted to support returnTypes defined in element metadata in api.json
  - @ui5-language-assistant/language-server@4.0.15

## 4.0.20

### Patch Changes

- d8b77af: Provide a minimal code completion and syntax check for property binding info
- Updated dependencies [d8b77af]
  - @ui5-language-assistant/language-server@4.0.14

## 4.0.19

### Patch Changes

- e3a6a0b: Template definition lookup logic enhanced in manifest details reader
  - @ui5-language-assistant/language-server@4.0.13

## 4.0.18

### Patch Changes

- 1c9a0c5: VSCode and BAS extension versions sync

## 4.0.17

### Patch Changes

- 0bbfb2c: Fixed incorrect update of README file in repo root

## 4.0.16

### Patch Changes

- 2a3d618: Issue 538 fix, for UI5 versions 1.38 and below the fallback 1.71.49 is used
  - @ui5-language-assistant/language-server@4.0.12

## 4.0.15

### Patch Changes

- c73d4fd: Unit test coverage improvement. Migration to Jest test framework
- Updated dependencies [c73d4fd]
  - @ui5-language-assistant/language-server@4.0.11

## 4.0.14

### Patch Changes

- d73f415: GitHub action artifact processing optimization

## 4.0.13

### Patch Changes

- bf9d891: update readme with formatter feature

## 4.0.12

### Patch Changes

- dff4ba6: Enable formatting
- Updated dependencies [dff4ba6]
  - @ui5-language-assistant/language-server@4.0.10

## 4.0.11

### Patch Changes

- 0af5e7d: Upgrade prettier
- Updated dependencies [0af5e7d]
  - @ui5-language-assistant/language-server@4.0.9

## 4.0.10

### Patch Changes

- 527f153: SonarQube config added
- 527f153: Support of contextPath provided in app manifest
  - @ui5-language-assistant/language-server@4.0.8

## 4.0.9

### Patch Changes

- 8353216: npmjs publish fix

## 4.0.8

### Patch Changes

- 930a813: Offline mode support
- Updated dependencies [930a813]
  - @ui5-language-assistant/language-server@4.0.7

## 4.0.7

### Patch Changes

- ce5a814: Switching from webpack to esbuild for bundling the code.
  Fix GitHub action build job to run build and tests on pull requests to master
- Updated dependencies [ce5a814]
  - @ui5-language-assistant/language-server@4.0.6

## 4.0.6

### Patch Changes

- 198cc8f: Migration from CircleCI to GitHub actions

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.5](https://github.com/SAP/ui5-language-assistant/compare/v4.0.4...v4.0.5) (2023-02-28)

### Bug Fixes

- completion in FragmentDefinition ([#567](https://github.com/SAP/ui5-language-assistant/issues/567)) ([44d780b](https://github.com/SAP/ui5-language-assistant/commit/44d780bc0666ea9055ed4ed797da26a119e91d21))
- crash when ui5.yaml has multiple documents ([#562](https://github.com/SAP/ui5-language-assistant/issues/562)) ([459cf5e](https://github.com/SAP/ui5-language-assistant/commit/459cf5ee1256691dcfade5e7783caef31fb6a467))

## [4.0.4](https://github.com/SAP/ui5-language-assistant/compare/v4.0.3...v4.0.4) (2023-02-16)

### Bug Fixes

- crash with no default model ([#558](https://github.com/SAP/ui5-language-assistant/issues/558)) ([09cb190](https://github.com/SAP/ui5-language-assistant/commit/09cb190c5fc03751f58afd81f3ef37436f652f1c))
- load app data with no models ([#559](https://github.com/SAP/ui5-language-assistant/issues/559)) ([9b872b1](https://github.com/SAP/ui5-language-assistant/commit/9b872b19508070b6f92a00925f96dbbc1b5e9b79))
- project root resolution ([#560](https://github.com/SAP/ui5-language-assistant/issues/560)) ([8a9bfd8](https://github.com/SAP/ui5-language-assistant/commit/8a9bfd82f99e4aa4ceaeee0a3f23192fa1725807))
- wrong version negotiation for OpenUI5 framework ([#561](https://github.com/SAP/ui5-language-assistant/issues/561)) ([9fcaf6d](https://github.com/SAP/ui5-language-assistant/commit/9fcaf6d067555b74c56e4c2b1fccb388935bbe77))

## [4.0.3](https://github.com/sap/ui5-language-assistant/compare/v4.0.2...v4.0.3) (2023-01-30)

### Bug Fixes

- vsix file content cleanup ([#550](https://github.com/sap/ui5-language-assistant/issues/550)) ([1a5dc1d](https://github.com/sap/ui5-language-assistant/commit/1a5dc1d5ebca92df12e4eb49ece2591b2e4bdd08))

## [4.0.2](https://github.com/sap/ui5-language-assistant/compare/v4.0.1...v4.0.2) (2023-01-26)

**Note:** Version bump only for package vscode-ui5-language-assistant

## [4.0.1](https://github.com/sap/ui5-language-assistant/compare/v4.0.0...v4.0.1) (2023-01-26)

**Note:** Version bump only for package vscode-ui5-language-assistant

# [4.0.0](https://github.com/sap/ui5-language-assistant/compare/v3.3.1...v4.0.0) (2023-01-26)

### Bug Fixes

- show ui diagnostics if minUI5 version undefined in manifest.json or unsupported ([#536](https://github.com/sap/ui5-language-assistant/issues/536)) ([06ced88](https://github.com/sap/ui5-language-assistant/commit/06ced889db7ce5da00e5c2957f05a1b1a62441a3))

### Features

- annotation relevant lsp package ([#535](https://github.com/sap/ui5-language-assistant/issues/535)) ([6b35d43](https://github.com/sap/ui5-language-assistant/commit/6b35d43e91753eef6bcd215d894ce69472b77863))
- introduce context package ([#523](https://github.com/sap/ui5-language-assistant/issues/523)) ([ce59328](https://github.com/sap/ui5-language-assistant/commit/ce59328b229cd55a2b2e606afd50785feffab5a5))

### BREAKING CHANGES

- introduce context by pr #523

Co-authored-by: Klaus Keller <klaus.keller@sap.com>

## [3.3.1](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/v3.3.0...v3.3.1) (2022-09-01)

**Note:** Version bump only for package vscode-ui5-language-assistant

# [3.3.0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/v3.2.1...v3.3.0) (2022-08-24)

### Features

- **language-server:** proxy support ([#478](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/478)) ([916d1e8](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/916d1e8d7f8309ddac19364d903357143442b7b0))
- add framework awareness by reading closest ui5.yaml ([#481](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/481)) ([9a81530](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/9a8153081def735df610b0709220411dd1ba0a69)), closes [#239](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/239)

## [3.2.1](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/v3.2.0...v3.2.1) (2022-08-20)

### Bug Fixes

- **language-server:** detect the UI5 version from closest manifest.json ([#472](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/472)) ([39c2728](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/39c2728809e02ac57e624c4b8e02a046d5f67b2d))

# [3.2.0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/v3.1.0...v3.2.0) (2022-08-15)

### Features

- multi-version support for UI5 XMLView code completion ([#469](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/469)) ([6cca109](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/6cca1092e01fbb77fdc510d039f0ce94529b2a9e)), closes [#468](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/468)

# [3.1.0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/v3.0.1...v3.1.0) (2021-10-10)

### Features

- add src/manifest.json path to jsonValidation ([#425](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/425)) ([f4aaf33](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/f4aaf333aeb17c1238747990e549edfa674830b6))

## [3.0.1](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/v3.0.0...v3.0.1) (2021-06-01)

**Note:** Version bump only for package vscode-ui5-language-assistant

# 3.0.0 (2021-06-01)

### Bug Fixes

- logging level scope changed, `resource`--> `window` ([a47abd0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/a47abd00c72a16a7cce960ddce4ad0a400c4c236))
- **vscode-ext:** more specific fileMatch patterns for manifest.json schema ([#297](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/297)) ([0eb9b6d](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/0eb9b6d205b9a1d12cf5559e6b1299e708b5819f))
- support namespace in aggregation name ([#150](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/150)) ([cff718b](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/cff718b4a2cfddc01cc5e44bd42eca68a8831832))
- **vscode-ui5-language-assistant:** full schema v1.19 ([#49](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/49)) ([b5592c3](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/b5592c307a86d72408463868b218ef60989c2ff0))

### Features

- add settings to include deprecated and experimental APIs ([#143](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/143)) ([fad2d9b](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/fad2d9b0c998fa2a1f3d8d4cd7ba8e997d24d30b))
- logging for language server ([#348](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/348)) ([7e2c30a](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/7e2c30a86cef9b239856dbef6df0f8785a210fc1))
- manifest.json state management ([#224](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/224)) ([da2682e](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/da2682e474ff13d42ad913a6c7e57bb65d546f66))
- non stable id quick fix ([#266](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/266)) ([c564db4](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/c564db4ed7a5ec9e026be0f10a72c734a366c3f7))
- set schema configuration for manifest.json ([#192](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/192)) ([7e7880a](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/7e7880af58a52f59241b956faa77f757a310b95f))
- suggest UI5 namespaces in xmlns attributes values ([#17](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/17)) ([46c84c4](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/46c84c4c5e2030fea255895a06cecbb5828fe31b))
- use github.com/sap/ui5-manifest schema ([#218](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/218)) ([ee8eef0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/ee8eef061f73ffac18ec9dee8dc119c11761e17b))

### Performance Improvements

- **language-server:** cache downloaded resources ([#50](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/50)) ([de8d7d5](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/de8d7d5e38c76666cc2590a885127b202096f289))

### Reverts

- remove Theia manifet.json via settings.json workaround ([#220](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/220)) ([4ca8eb9](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/4ca8eb92c509a78ccc1f6ea9acac76cccdbc4fee))

## [1.7.2](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.7.1...vscode-ui5-language-assistant@1.7.2) (2021-05-04)

**Note:** Version bump only for package vscode-ui5-language-assistant

## [1.7.1](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.7.0...vscode-ui5-language-assistant@1.7.1) (2021-01-03)

### Bug Fixes

- logging level scope changed, `resource`--> `window` ([a47abd0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/a47abd00c72a16a7cce960ddce4ad0a400c4c236))

# [1.7.0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.6.1...vscode-ui5-language-assistant@1.7.0) (2020-12-30)

### Features

- logging for language server ([#348](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/348)) ([7e2c30a](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/7e2c30a86cef9b239856dbef6df0f8785a210fc1))

## [1.6.1](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.6.0...vscode-ui5-language-assistant@1.6.1) (2020-08-27)

### Bug Fixes

- **vscode-ext:** more specific fileMatch patterns for manifest.json schema ([#297](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/297)) ([0eb9b6d](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/0eb9b6d205b9a1d12cf5559e6b1299e708b5819f))

# [1.6.0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.5.1...vscode-ui5-language-assistant@1.6.0) (2020-08-12)

### Features

- non stable id quick fix ([#266](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/266)) ([c564db4](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/c564db4ed7a5ec9e026be0f10a72c734a366c3f7))

## [1.5.1](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.5.0...vscode-ui5-language-assistant@1.5.1) (2020-07-15)

**Note:** Version bump only for package vscode-ui5-language-assistant

# [1.5.0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.4.1...vscode-ui5-language-assistant@1.5.0) (2020-07-08)

### Features

- manifest.json state management ([#224](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/224)) ([da2682e](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/da2682e474ff13d42ad913a6c7e57bb65d546f66))

## [1.4.1](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.4.0...vscode-ui5-language-assistant@1.4.1) (2020-07-02)

### Reverts

- remove Theia manifet.json via settings.json workaround ([#220](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/220)) ([4ca8eb9](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/4ca8eb92c509a78ccc1f6ea9acac76cccdbc4fee))

# [1.4.0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.3.0...vscode-ui5-language-assistant@1.4.0) (2020-06-30)

### Features

- use github.com/sap/ui5-manifest schema ([#218](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/218)) ([ee8eef0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/ee8eef061f73ffac18ec9dee8dc119c11761e17b))

# [1.3.0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.2.0...vscode-ui5-language-assistant@1.3.0) (2020-06-29)

### Features

- set schema configuration for manifest.json ([#192](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/192)) ([7e7880a](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/7e7880af58a52f59241b956faa77f757a310b95f))

# [1.2.0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.1.8...vscode-ui5-language-assistant@1.2.0) (2020-06-17)

### Features

- add settings to include deprecated and experimental APIs ([#143](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/143)) ([fad2d9b](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/fad2d9b0c998fa2a1f3d8d4cd7ba8e997d24d30b))

## [1.1.8](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.1.7...vscode-ui5-language-assistant@1.1.8) (2020-06-03)

### Bug Fixes

- support namespace in aggregation name ([#150](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/150)) ([cff718b](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/cff718b4a2cfddc01cc5e44bd42eca68a8831832))

## [1.1.7](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.1.6...vscode-ui5-language-assistant@1.1.7) (2020-05-20)

**Note:** Version bump only for package vscode-ui5-language-assistant

## [1.1.6](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.1.5...vscode-ui5-language-assistant@1.1.6) (2020-05-20)

**Note:** Version bump only for package vscode-ui5-language-assistant

## [1.1.5](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.1.4...vscode-ui5-language-assistant@1.1.5) (2020-05-20)

**Note:** Version bump only for package vscode-ui5-language-assistant

## [1.1.4](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.1.3...vscode-ui5-language-assistant@1.1.4) (2020-05-06)

**Note:** Version bump only for package vscode-ui5-language-assistant

## [1.1.3](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.1.2...vscode-ui5-language-assistant@1.1.3) (2020-04-23)

**Note:** Version bump only for package vscode-ui5-language-assistant

## [1.1.2](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.1.1...vscode-ui5-language-assistant@1.1.2) (2020-04-07)

**Note:** Version bump only for package vscode-ui5-language-assistant

## [1.1.1](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.1.0...vscode-ui5-language-assistant@1.1.1) (2020-04-07)

### Bug Fixes

- **vscode-ui5-language-assistant:** full schema v1.19 ([#49](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/49)) ([b5592c3](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/b5592c307a86d72408463868b218ef60989c2ff0))

### Performance Improvements

- **language-server:** cache downloaded resources ([#50](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/50)) ([de8d7d5](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/de8d7d5e38c76666cc2590a885127b202096f289))

# [1.1.0](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/compare/vscode-ui5-language-assistant@1.0.0...vscode-ui5-language-assistant@1.1.0) (2020-04-01)

### Features

- suggest UI5 namespaces in xmlns attributes values ([#17](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/issues/17)) ([46c84c4](https://github.com/sap/ui5-language-assistant/tree/master/packages/vscode-ui5-language-assistant/commit/46c84c4c5e2030fea255895a06cecbb5828fe31b))

# 1.0.0 (2020-03-31)

**Note:** Version bump only for package vscode-ui5-language-assistant
