# UI5 Language Support

A VSCode extension providing UI5 language editor support.

Existing Features:

- Content assist / completions in UI5 XML views.
  - Both `*.view.xml` and `*.fragment.xml` files

Potential future features:

- Support multiple versions of UI5 metadata.
- Semantic validations in UI5 XML views.
- UI5 manifest.json semantic validations and content assist.

## Installation

This extension is **not** yet released to the VSCode Marketplace.
Instead it can be downloaded directly from [Github Releases](https://github.com/SAP/ui5-editor-tools/releases/).

- The .vsix archive can be found under the **"ui5-editor-tools@x.y.z"** releases.
- Replace `x.y.z` with the desired version number.

## Usage

This extension's features will automatically be enabled when opening/editing relevant UI5 source files.
In the case of UI5 XML views this means:`*.view.xml` or `*.fragment.xml` files.

Note that the extension **lazily** downloads the UI5 metadata needed for its features.
This means there may be a delay between starting VSCode and having the relevant features available.

## Limitations

The extension currently uses a hard-coded (1.71.x) version for the UI5 metadata.

## Support

Please open [issues](https://github.com/SAP/ui5-editor-tools/issues) on github.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the [LICENSE file](../../LICENSE).
