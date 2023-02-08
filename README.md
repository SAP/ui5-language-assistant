[![CircleCI](https://circleci.com/gh/SAP/ui5-language-assistant.svg?style=svg)](https://circleci.com/gh/SAP/ui5-language-assistant)
[![Coverage Status](https://coveralls.io/repos/github/SAP/ui5-language-assistant/badge.svg?branch=master)](https://coveralls.io/github/SAP/ui5-language-assistant?branch=master)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/SAP/ui5-language-assistant.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/SAP/ui5-language-assistant/context:javascript)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![DependentBot](https://api.dependabot.com/badges/status?host=github&repo=SAP/ui5-language-assistant)](https://dependabot.com/)
[![REUSE status](https://api.reuse.software/badge/github.com/SAP/ui5-language-assistant)](https://api.reuse.software/info/github.com/SAP/ui5-language-assistant)

# UI5 Language Assistant

This npm [mono-repo][mono-repo] contains editor related tooling for [SAPUI5][ui5] and [OpenUI5][openui5] projects.

It currently contains:

- The [UI5 language assistant](./packages/vscode-ui5-language-assistant) VSCode Extension consisting of the following packages:

  - [@ui5-language-assistant/language-server](./packages/language-server) UI5 Language Server.
  - [@ui5-language-assistant/context](./packages/context) Common shared data model container (UI5 API loaded version cache, project information, ODATA services, manifest information, etc.) with utilities to load and parse the data used in other packages in this mono-repo.
  - [@ui5-language-assistant/fe](./packages/context) UI5 Language Server extension to support completion and diagnostics of ODATA annotations related data.
  - [@ui5-language-assistant/logic-utils](./packages/logic-utils) Common shared logic and data structures related utilities used in other packages in this mono-repo.
  - [@ui5-language-assistant/semantic-model](./packages/semantic-model) Data structure and related utils to represent the UI5 metadata.
  - [@ui5-language-assistant/semantic-model-types](./packages/semantic-model-types) Type signatures for the semantic model.
  - [@ui5-language-assistant/settings](./packages/settings) Settings used in other packages in this mono-repo.
  - [@ui5-language-assistant/user-facing-text](./packages/user-facing-text) User facing text used in other packages in this mono-repo.
  - [@ui5-language-assistant/xml-views-completion](./packages/xml-views-completion) Logic for UI5 XML views code assist.
  - [@ui5-language-assistant/xml-views-tooltip](./packages/xml-views-tooltip) Logic for UI5 XML views hover tooltip.
  - [@ui5-language-assistant/xml-views-validation](./packages/xml-views-validation) Logic for UI5 XML views semantic validations.
  - [@ui5-language-assistant/xml-views-quick-fix](./packages/xml-views-quick-fix) Logic for UI5 XML-Views quick-fixes.
  - [@ui5-language-assistant/xml-views-quick-fix](./packages/xml-views-quick-fix) Logic for UI5 XML-Views quick-fixes.

- The wrapper module for SAP Business Application Studio simple extension containing UI5 Language Assistant bundled into VSCode extension vsix file
  - [![npm-bas-ext][npm-bas-ext-image]][npm-bas-ext-url] [@ui5-language-assistant/vscode-ui5-language-assistant-bas-ext](./packages/vscode-ui5-language-assistant-bas-ext)

[npm-language-server-image]: https://img.shields.io/npm/v/@ui5-language-assistant/language-server.svg
[npm-bas-ext-url]: https://www.npmjs.com/package/@ui5-language-assistant/vscode-ui5-language-assistant-bas-ext
[npm-bas-ext-image]: https://img.shields.io/npm/v/@ui5-language-assistant/vscode-ui5-language-assistant-bas-ext.svg

## Support

Please open [issues](https://github.com/SAP/ui5-language-assistant/issues) on github.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

[mono-repo]: https://github.com/babel/babel/blob/master/doc/design/monorepo.md
[ui5]: https://ui5.sap.com
[openui5]: https://openui5.org

## Licensing

Copyright 2023 SAP SE. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/ui5-language-assistant).
