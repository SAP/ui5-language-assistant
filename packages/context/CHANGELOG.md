# Change Log

## 4.0.36

### Patch Changes

- Updated dependencies [bb43dd2]
  - @ui5-language-assistant/constant@0.0.4
  - @ui5-language-assistant/logic-utils@4.0.24

## 4.0.35

### Patch Changes

- 870d01a: fix: update manifest cache after reading new manifest

## 4.0.34

### Patch Changes

- ad36b43: fix: catch exception
- Updated dependencies [ad36b43]
  - @ui5-language-assistant/constant@0.0.3
  - @ui5-language-assistant/logic-utils@4.0.23

## 4.0.33

### Patch Changes

- c8bb0ec: feat: new logo
- Updated dependencies [c8bb0ec]
  - @ui5-language-assistant/constant@0.0.2
  - @ui5-language-assistant/logic-utils@4.0.22

## 4.0.32

### Patch Changes

- 1a974e0: fix: use latest ui5 version incase of s4 placeholder

## 4.0.31

### Patch Changes

- 3abf9a6: feat: User settings to control diagnostics reporting cross view files
- Updated dependencies [3abf9a6]
  - @ui5-language-assistant/settings@4.0.10
  - @ui5-language-assistant/logger@0.0.2
  - @ui5-language-assistant/logic-utils@4.0.21

## 4.0.30

### Patch Changes

- 6fe3662: fix: lsp for adaption project - first iteration

## 4.0.29

### Patch Changes

- d6ceeaa: feat: support unique id generation across view files in an application
- Updated dependencies [d6ceeaa]
  - @ui5-language-assistant/logic-utils@4.0.20

## 4.0.28

### Patch Changes

- a82d24c: fix: reference

## 4.0.27

### Patch Changes

- b2a8d01: fix: introduce constant package to handle UI5 default version in central package
- Updated dependencies [b2a8d01]
  - @ui5-language-assistant/logic-utils@4.0.19
  - @ui5-language-assistant/constant@0.0.1

## 4.0.26

### Patch Changes

- fa811f5: fix: support `minUI5Version` as an array

## 4.0.25

### Patch Changes

- ceab281: Enable go to controller's definition from XML view file

## 4.0.24

### Patch Changes

- Updated dependencies [7edb021]
  - @ui5-language-assistant/logic-utils@4.0.18

## 4.0.23

### Patch Changes

- 0186685: Fallback to the latest supported patch version
- Updated dependencies [0186685]
  - @ui5-language-assistant/logic-utils@4.0.17

## 4.0.22

### Patch Changes

- a9a2141: Add logger package
- Updated dependencies [a9a2141]
  - @ui5-language-assistant/logic-utils@4.0.16

## 4.0.21

### Patch Changes

- 910e437: Adaptation to the latest UI5 maintenance changes
- Updated dependencies [910e437]
  - @ui5-language-assistant/logic-utils@4.0.15

## 4.0.20

### Patch Changes

- ccd5eae: Adapt non stable id message

## 4.0.19

### Patch Changes

- 222a0f5: Code completion for context path is disabled, S/4 version placeholder in manifest's minUI5Version property defaults to the latest available version

## 4.0.18

### Patch Changes

- Updated dependencies [905a6be]
  - @ui5-language-assistant/logic-utils@4.0.14

## 4.0.17

### Patch Changes

- Updated dependencies [8fff87d]
  - @ui5-language-assistant/logic-utils@4.0.13

## 4.0.16

### Patch Changes

- 1a96f91: update package.json files

## 4.0.15

### Patch Changes

- @ui5-language-assistant/logic-utils@4.0.12

## 4.0.14

### Patch Changes

- Updated dependencies [f670b06]
  - @ui5-language-assistant/logic-utils@4.0.11

## 4.0.13

### Patch Changes

- d8b77af: Provide a minimal code completion and syntax check for property binding info
- Updated dependencies [d8b77af]
  - @ui5-language-assistant/logic-utils@4.0.10
  - @ui5-language-assistant/settings@4.0.9

## 4.0.12

### Patch Changes

- e3a6a0b: Template definition lookup logic enhanced in manifest details reader

## 4.0.11

### Patch Changes

- 2a3d618: Issue 538 fix, for UI5 versions 1.38 and below the fallback 1.71.49 is used

## 4.0.10

### Patch Changes

- c73d4fd: Unit test coverage improvement. Migration to Jest test framework
- Updated dependencies [c73d4fd]
  - @ui5-language-assistant/logic-utils@4.0.9
  - @ui5-language-assistant/settings@4.0.8

## 4.0.9

### Patch Changes

- dff4ba6: Enable formatting
- Updated dependencies [dff4ba6]
  - @ui5-language-assistant/logic-utils@4.0.8
  - @ui5-language-assistant/settings@4.0.7

## 4.0.8

### Patch Changes

- 0af5e7d: Upgrade prettier
- Updated dependencies [0af5e7d]
  - @ui5-language-assistant/logic-utils@4.0.7

## 4.0.7

### Patch Changes

- 527f153: Support of contextPath provided in app manifest

## 4.0.6

### Patch Changes

- 930a813: Offline mode support
- Updated dependencies [930a813]
  - @ui5-language-assistant/logic-utils@4.0.6
  - @ui5-language-assistant/settings@4.0.6

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.5](https://github.com/sap/ui5-language-assistant/compare/v4.0.4...v4.0.5) (2023-02-28)

### Bug Fixes

- crash when ui5.yaml has multiple documents ([#562](https://github.com/sap/ui5-language-assistant/issues/562)) ([459cf5e](https://github.com/sap/ui5-language-assistant/commit/459cf5ee1256691dcfade5e7783caef31fb6a467))

## [4.0.4](https://github.com/sap/ui5-language-assistant/compare/v4.0.3...v4.0.4) (2023-02-16)

### Bug Fixes

- crash with no default model ([#558](https://github.com/sap/ui5-language-assistant/issues/558)) ([09cb190](https://github.com/sap/ui5-language-assistant/commit/09cb190c5fc03751f58afd81f3ef37436f652f1c))
- load app data with no models ([#559](https://github.com/sap/ui5-language-assistant/issues/559)) ([9b872b1](https://github.com/sap/ui5-language-assistant/commit/9b872b19508070b6f92a00925f96dbbc1b5e9b79))
- project root resolution ([#560](https://github.com/sap/ui5-language-assistant/issues/560)) ([8a9bfd8](https://github.com/sap/ui5-language-assistant/commit/8a9bfd82f99e4aa4ceaeee0a3f23192fa1725807))
- wrong version negotiation for OpenUI5 framework ([#561](https://github.com/sap/ui5-language-assistant/issues/561)) ([9fcaf6d](https://github.com/sap/ui5-language-assistant/commit/9fcaf6d067555b74c56e4c2b1fccb388935bbe77))

## [4.0.3](https://github.com/sap/ui5-language-assistant/compare/v4.0.2...v4.0.3) (2023-01-30)

**Note:** Version bump only for package @ui5-language-assistant/context

## [4.0.2](https://github.com/sap/ui5-language-assistant/compare/v4.0.1...v4.0.2) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/context

## [4.0.1](https://github.com/sap/ui5-language-assistant/compare/v4.0.0...v4.0.1) (2023-01-26)

**Note:** Version bump only for package @ui5-language-assistant/context

# [4.0.0](https://github.com/sap/ui5-language-assistant/compare/v3.3.1...v4.0.0) (2023-01-26)

### Bug Fixes

- show ui diagnostics if minUI5 version undefined in manifest.json or unsupported ([#536](https://github.com/sap/ui5-language-assistant/issues/536)) ([06ced88](https://github.com/sap/ui5-language-assistant/commit/06ced889db7ce5da00e5c2957f05a1b1a62441a3))

### Features

- annotation relevant lsp package ([#535](https://github.com/sap/ui5-language-assistant/issues/535)) ([6b35d43](https://github.com/sap/ui5-language-assistant/commit/6b35d43e91753eef6bcd215d894ce69472b77863))
- introduce context package ([#523](https://github.com/sap/ui5-language-assistant/issues/523)) ([ce59328](https://github.com/sap/ui5-language-assistant/commit/ce59328b229cd55a2b2e606afd50785feffab5a5))

### BREAKING CHANGES

- introduce context by pr #523

Co-authored-by: Klaus Keller <klaus.keller@sap.com>
