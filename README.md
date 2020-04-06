[![CircleCI](https://circleci.com/gh/SAP/ui5-language-assistant.svg?style=svg)](https://circleci.com/gh/SAP/ui5-language-assistant)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![DependentBot](https://api.dependabot.com/badges/status?host=github&repo=SAP/ui5-language-assistant)](https://dependabot.com/)

# UI5 Language Assistant

This npm [mono-repo][mono-repo] contains editor related tooling for [SAP UI5][ui5] and [SAP OpenUI5][openui5] projects.

It currently contains:

The [UI5 language assistant](./packages/vscode-ui5-language-assistant) VSCode Extension.

The following packages:

- [![npm-xml-views-completion][npm-xml-views-completion-image]][npm-xml-views-completion-url] [@ui5-language-assistant/xml-views-completion](./packages/xml-views-completion) Logic for UI5 XML views code assist.
- [![npm-semantic-model][npm-semantic-model-image]][npm-semantic-model-url] [@ui5-language-assistant/semantic-model](./packages/semantic-model) Data structure and related utils to represent the UI5 metadata.
- [![npm-semantic-model-types][npm-semantic-model-types-image]][npm-semantic-model-types-url] [@ui5-language-assistant/semantic-model-types](./packages/semantic-model-types) Type signatures for the semantic model.

[npm-xml-views-completion-image]: https://img.shields.io/npm/v/@ui5-language-assistant/xml-views-completion.svg
[npm-xml-views-completion-url]: https://www.npmjs.com/package/@ui5-language-assistant/xml-views-completion
[npm-semantic-model-image]: https://img.shields.io/npm/v/@ui5-language-assistant/semantic-model.svg
[npm-semantic-model-url]: https://www.npmjs.com/package/@ui5-language-assistant/semantic-model
[npm-semantic-model-types-image]: https://img.shields.io/npm/v/@ui5-language-assistant/semantic-model-types.svg
[npm-semantic-model-types-url]: https://www.npmjs.com/package/@ui5-language-assistant/semantic-model-types

## Support

Please open [issues](https://github.com/SAP/ui5-language-assistant/issues) on github.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the [LICENSE file](./LICENSE).

[mono-repo]: https://github.com/babel/babel/blob/master/doc/design/monorepo.md
[ui5]: https://ui5.sap.com
[openui5]: https://openui5.org
