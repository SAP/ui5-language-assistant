# Contribution Guide

Please see the top level [Contribution Guide](../../CONTRIBUTING.md) for the project setup and all development flows.

## Package-specific Development Flows

This package is an LSP Server and uses [The VS Code Language Server library](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide) to implement the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/).

### Manual Testing and Debugging

To start the language server, first you must start the VS Code extension that runs it by launching the `Launch Client` configuration in the [`launch.json`](../../.vscode/launch.json) file from VS Code. This will open a new instance of VS Code that can be used for debugging.
After the server is started, attach the debugger to the process by launching the `Attach to Server` configuration in the same [`launch.json`](../../.vscode/launch.json) file.

See the [`vscode-ui5-ui5-language-assistant` contribution guide](../vscode-ui5-ui5-language-assistant/CONTRIBUTING.md) for how to see the messages passed between the VS Code extension and the LSP server.
