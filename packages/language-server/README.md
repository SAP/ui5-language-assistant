[![npm (scoped)](https://img.shields.io/npm/v/@ui5-editor-tools/language-server.svg)](https://www.npmjs.com/package/@ui5-editor-tools/language-server)

# @ui5-editor-tools/language-server

UI5 Language Server

Current Features:

- Completions in XML Views - xml view files code assist for UI5 elements such as: events, attributes, namespaces, etc. matching the UI5 version assigned to the project to avoid errors and wrong UI5 elements spelling.

## Installation

With npm:

- `npm install @ui5-editor-tools/language-server`

With Yarn

- `yarn add @ui5-editor-tools/language-server`

## Usage

A simple usage example:

```typescript
const SERVER_PATH: string = resolve(__dirname, "server.js");

// SERVER_PATH is the only API currently and it is meant to expose the "main" module's absolute
// path which would then be executed in a different process
console.log(SERVER_PATH); // --> .../node_module/@ui5-editor-tools/language-server/lib/server.js
```

## Support

Please open [issues](https://github.com/SAP/ui5-editor-tools/issues) on github.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the [LICENSE file](../../LICENSE).
