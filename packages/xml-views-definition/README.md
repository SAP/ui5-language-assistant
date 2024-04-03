[![npm (scoped)](https://img.shields.io/npm/v/@ui5-language-assistant/xml-views-definition.svg)](https://www.npmjs.com/package/@ui5-language-assistant/xml-views-definition)

# @ui5-language-assistant/xml-views-definition

Logic for goto definition of Language Server Protocol (LSP).

## Supported scenarios:

### From XML to controllers' definition:

It supports dot or object notation for following XML attributes.

- "controllerName"
- "template:require"
- "core:require"

It resolves controllers' definition as follows:

1. It tries to load `<path>.controller.js`
2. It tries to load `<path>.js`
3. It tries to load `<path>.controller.ts`
4. It tries to load `<path>.ts`

## Usage

This package only exposes programmatic APIs, import the package and use the exported APIs
defined in [api.d.ts](./api.d.ts).

## Support

Please open [issues](https://github.com/SAP/ui5-language-assistant/issues) on github.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licensing

Copyright 2022 SAP SE. Please see our [LICENSE](../../LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/ui5-language-assistant).
