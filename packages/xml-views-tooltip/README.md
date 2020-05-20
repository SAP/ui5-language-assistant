[![npm (scoped)](https://img.shields.io/npm/v/@ui5-language-assistant/xml-views-tooltip.svg)](https://www.npmjs.com/package/@ui5-language-assistant/xml-views-tooltip)

# @ui5-language-assistant/xml-views-tooltip

Logic for UI5 XML views hover tooltip.

Supported Hover Tooltip scenarios:

### In XML tag names:

- UI5 Classes.
  - Both under default (implicit) aggregations and explicit aggregations.
- UI5 Aggregations.
  - According to the parent tag's matching UI5 class name.

### In XML attribute names:

- UI5 properties, events, aggregations and associations.
  - Both direct and inherited.

### In XML attribute values:

- UI5 namspaces inside xmlns attributes.
- Enum fields.

## Installation

With npm:

- `npm install @ui5-language-assistant/xml-views-tooltip`

With Yarn:

- `yarn add @ui5-language-assistant/xml-views-tooltip`

## Usage

This package only exposes programmatic APIs, import the package and use the exported APIs
defined in [api.d.ts](./api.d.ts).

## Support

Please open [issues](https://github.com/SAP/ui5-language-assistant/issues) on github.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the [LICENSE file](../../LICENSE).
