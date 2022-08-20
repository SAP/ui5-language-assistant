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

The [UI5 language assistant](./packages/vscode-ui5-language-assistant) VSCode Extension.

The following packages:

- [![npm-language-server][npm-language-server-image]][npm-language-server-url] [@ui5-language-assistant/language-server](./packages/language-server) UI5 Language Server.
- [![npm-logic-utils][npm-logic-utils-image]][npm-logic-utils-url] [@ui5-language-assistant/logic-utils](./packages/logic-utils) Common shared logic and data structures related utilities used in other packages in this mono-repo.
- [![npm-semantic-model][npm-semantic-model-image]][npm-semantic-model-url] [@ui5-language-assistant/semantic-model](./packages/semantic-model) Data structure and related utils to represent the UI5 metadata.
- [![npm-semantic-model-types][npm-semantic-model-types-image]][npm-semantic-model-types-url] [@ui5-language-assistant/semantic-model-types](./packages/semantic-model-types) Type signatures for the semantic model.
- [![npm-settings][npm-settings-image]][npm-settings-url] [@ui5-language-assistant/settings](./packages/settings) Settings used in other packages in this mono-repo.
- [![npm-user-facing-text][npm-user-facing-text-image]][npm-user-facing-text-url] [@ui5-language-assistant/user-facing-text](./packages/user-facing-text) User facing text used in other packages in this mono-repo.
- [![npm-xml-views-completion][npm-xml-views-completion-image]][npm-xml-views-completion-url] [@ui5-language-assistant/xml-views-completion](./packages/xml-views-completion) Logic for UI5 XML views code assist.
- [![npm-xml-views-tooltip][npm-xml-views-tooltip-image]][npm-xml-views-tooltip-url] [@ui5-language-assistant/xml-views-tooltip](./packages/xml-views-tooltip) Logic for UI5 XML views hover tooltip.
- [![npm-xml-views-validation][npm-xml-views-validation-image]][npm-xml-views-validation-url] [@ui5-language-assistant/xml-views-validation](./packages/xml-views-validation) Logic for UI5 XML views semantic validations.
- [![npm-xml-views-quick-fix][npm-xml-views-quick-fix-image]][npm-xml-views-quick-fix-url] [@ui5-language-assistant/xml-views-quick-fix](./packages/xml-views-quick-fix) Logic for UI5 XML-Views quick-fixes.

[npm-language-server-image]: https://img.shields.io/npm/v/@ui5-language-assistant/language-server.svg
[npm-language-server-url]: https://www.npmjs.com/package/@ui5-language-assistant/language-server
[npm-logic-utils-image]: https://img.shields.io/npm/v/@ui5-language-assistant/logic-utils.svg
[npm-logic-utils-url]: https://www.npmjs.com/package/@ui5-language-assistant/logic-utils
[npm-semantic-model-image]: https://img.shields.io/npm/v/@ui5-language-assistant/semantic-model.svg
[npm-semantic-model-url]: https://www.npmjs.com/package/@ui5-language-assistant/semantic-model
[npm-semantic-model-types-image]: https://img.shields.io/npm/v/@ui5-language-assistant/semantic-model-types.svg
[npm-semantic-model-types-url]: https://www.npmjs.com/package/@ui5-language-assistant/semantic-model-types
[npm-settings-image]: https://img.shields.io/npm/v/@ui5-language-assistant/settings.svg
[npm-settings-url]: https://www.npmjs.com/package/@ui5-language-assistant/settings
[npm-user-facing-text-image]: https://img.shields.io/npm/v/@ui5-language-assistant/user-facing-text.svg
[npm-user-facing-text-url]: https://www.npmjs.com/package/@ui5-language-assistant/user-facing-text
[npm-xml-views-completion-image]: https://img.shields.io/npm/v/@ui5-language-assistant/xml-views-completion.svg
[npm-xml-views-completion-url]: https://www.npmjs.com/package/@ui5-language-assistant/xml-views-completion
[npm-xml-views-tooltip-image]: https://img.shields.io/npm/v/@ui5-language-assistant/xml-views-tooltip.svg
[npm-xml-views-tooltip-url]: https://www.npmjs.com/package/@ui5-language-assistant/xml-views-tooltip
[npm-xml-views-validation-image]: https://img.shields.io/npm/v/@ui5-language-assistant/xml-views-validation.svg
[npm-xml-views-validation-url]: https://www.npmjs.com/package/@ui5-language-assistant/xml-views-validation
[npm-xml-views-quick-fix-image]: https://img.shields.io/npm/v/@ui5-language-assistant/xml-views-quick-fix.svg
[npm-xml-views-quick-fix-url]: https://www.npmjs.com/package/@ui5-language-assistant/xml-views-quick-fix

## Support

Please open [issues](https://github.com/SAP/ui5-language-assistant/issues) on github.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

[mono-repo]: https://github.com/babel/babel/blob/master/doc/design/monorepo.md
[ui5]: https://ui5.sap.com
[openui5]: https://openui5.org

## Licensing

Copyright 2022 SAP SE. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/ui5-language-assistant).
