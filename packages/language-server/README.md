[![npm (scoped)](https://img.shields.io/npm/v/@ui5-editor-tools/language-server.svg)](https://www.npmjs.com/package/@ui5-editor-tools/language-server)

# @ui5-editor-tools/language-server

UI5 Language Server

Current Features:

### Completions in XML Views

- In XML tags names:
  - **UI5 Classes** names filtered by aggregation's type.
  - **UI5 Aggregations** names filtered by the parent UI5 Class metadata.
- In XML Attributes keys:
  - **Events, Properties and Associations** filtered by the parent UI5 Class metadata.
- In XML Attributes values:
  - **UI5 Enum Values** filtered by the parent UI5 Class metadata.
- In `xmlns` attributes keys:
  **UI5 Namespaces** suggested after the xmlns colon (\:)
- In `xmlns` attributes values:
  **UI5 Namespaces**

## Installation

With npm:

- `npm install @ui5-editor-tools/language-server`

With Yarn

- `yarn add @ui5-editor-tools/language-server`

## Usage

This package does not export "regular" programmatic APIS as it is meant to be started in a separate process.
Instead a `SERVER_PATH` const is exported which points the the server's "main" module.

This `SERVER_PATH` can be used by other tools to spawn the @ui5-editor-tools/language-server process.

- See [extension.ts](../vscode-ui5-language-support/src/extension.ts) in the UI5 Language Support VSCode extension.

## Support

Please open [issues](https://github.com/SAP/ui5-editor-tools/issues) on github.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the [LICENSE file](../../LICENSE).
