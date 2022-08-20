[![npm (scoped)](https://img.shields.io/npm/v/@ui5-language-assistant/xml-views-completion.svg)](https://www.npmjs.com/package/@ui5-language-assistant/xml-views-completion)

# @ui5-language-assistant/xml-views-completion

Logic for UI5 XML views content assist implemented by combining:

- [@xml-tools/content-assist](https://github.com/sap/xml-tools/tree/master/packages/content-assist) for the generic syntactic XML information.
- [@ui5-language-assistant/semantic-model](../semantic-model) for the semantic UI5 data.

Supported Content Assist scenarios:

### In XML tag names:

- UI5 Classes.
  - Both under default (implicit) aggregations and explicit aggregations.
  - UI5 Aggregations.
    - Suggested according to the parent tag's matching UI5 class name.

### In XML attribute names:

- UI5 properties, events and associations.
  - Both direct and inherited.

### In XML `xmlns` attributes keys:

- suggestions in the xmlns prefix part.

## Installation

With npm:

- `npm install @ui5-language-assistant/xml-views-completion`

With Yarn:

- `yarn add @ui5-language-assistant/xml-views-completion`

## Usage

This package only exposes programmatic APIs, import the package and use the exported APIs
defined in [api.d.ts](./api.d.ts).

## Support

Please open [issues](https://github.com/SAP/ui5-language-assistant/issues) on github.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licensing

Copyright 2022 SAP SE. Please see our [LICENSE](../../LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/ui5-language-assistant).
