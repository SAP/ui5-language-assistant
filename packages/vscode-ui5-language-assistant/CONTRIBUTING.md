# Contribution Guide

Please see the top level [Contribution Guide](../../CONTRIBUTING.md) for the project setup and all development flows.

## Updating the List of Features

The [README.md](./README.md) includes a list of features.
Each commit which adds a new feature, **must** also update the list of features.

By modifying this package's files in a `feat:` type commit As that will ensure
This package's [CHANGELOG](./CHANGELOG.md) and **version** will be updated appropriately
during release.

## Package-specific Development Flows

This package is a VS Code extension and uses [VS Code APIs](https://code.visualstudio.com/api).

### Manual Testing and Debugging

Running the extension is done by launching the `Launch Client` configuration in the [`launch.json`](../../.vscode/launch.json) file from VS Code. This will open a new instance of VS Code that can be used for debugging.

The VS Code extension starts the LSP process from the `language-server` package. See the [`language-server` contribution guide](../language-server/CONTRIBUTING.md) for development flows relevant for the LSP server.

To see the messages passed between the VS Code extension and the LSP server, in the opened instance of VS Code that has the extension, open `File > Preferences > Settings`, navigate to `Extensions > UI5 Editor Tools` and set the `Trace: server` configuration to `messages` or `verbose`. The messages are written to the output channel `UI5 Editor Tools`.

## LSP for `manifest.json` file incase of offline mode

To get complete LSP support for `manifest.json` file incase of offline mode, content of [schema](https://raw.githubusercontent.com/SAP/ui5-manifest/master/schema.json) _MUST_ be downloaded and saved in `manifest>schema.json` file. Furthermore, its content _MUST_ be scan to identify any `http(s)` references. In case any reference is found, its content _MUST_ be downloaded and saved in `manifest><any-reference>.json` and its reference _MUST_ be replaced by `"/manifest/<any-reference>.json"` in `manifest>schema.json`. Currently there is only one such case e.g `"https://adaptivecards.io/schemas/adaptive-card.json#/definitions/AdaptiveCard"` for which `adaptive-card.json` file is created and its content is downloaded and paste in that file. Moreover its reference in `manifest>schema.json` is replaced by `"/manifest/adaptive-card.json"`
