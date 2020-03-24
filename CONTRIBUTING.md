# Contribution Guide

This is the common top level contribution guide for this mono-repo.
A sub-package **may** have an additional CONTRIBUTING.md file if needed.

## Legal

All contributors must sign the CLA

- https://cla-assistant.io/SAP/ui5-editor-tools

This is managed automatically via https://cla-assistant.io/ pull request voter.

## Development Environment

### pre-requisites

- [Yarn](https://yarnpkg.com/lang/en/docs/install/) >= 1.4.2
  - Yarn rather than npm is needed as this mono-repo uses [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).
- A [maintained version](https://nodejs.org/en/about/releases/) of node.js
  - This package is targeted and tested on modern/supported versions of node.js only.
    Which means 8/10/12/13 at the time of writing this document.
- [commitizen](https://github.com/commitizen/cz-cli#installing-the-command-line-tool) for managing commit messages.

### Initial Setup

The initial setup is trivial:

- clone this repo
- `yarn`

### Committing Changes

Use `git cz` to build conventional commit messages.

- requires [commitizen](https://github.com/commitizen/cz-cli#installing-the-command-line-tool) to be installed.

### Formatting.

[Prettier](https://prettier.io/) is used to ensure consistent code formatting in this repository.
This is normally transparent as it automatically activated in a pre-commit hook using [lint-staged](https://github.com/okonet/lint-staged).
However this does mean that dev flows that do not use a full dev env (e.g editing directly on github)
may result in voter failures due to formatting errors.

### Compiling

TypeScript is the main programming language used in this mono-repo.

Use the following npm scripts at the repo's **root** to compile **all** the sub-packages productive (excluding tests)
source code:

- `yarn compile`
- `yarn compile:watch` (will watch files for changes and re-compile as needed)

These commands are also available in each sub-package. However it is recommended to
use the top level scripts to avoid forgetting to (re-)compile a sub-package's dependency.

### Testing

[Mocha][mocha] is used for unit-testing and [Istanbul/Nyc][istanbul] for coverage reports.
Jest was avoided due to increased total tests execution time due to running the tests in multiple processes,
as the Parser initialization (which happens once per process) can take 10-20ms.

[mocha]: https://mochajs.org/
[istanbul]: https://istanbul.js.org/

- To run the tests run `yarn test` in either the top level package or a specific subpackage.
- To run the tests with a coverage report run `yarn coverage:run` in either the top level package or a specific subpackage.

#### Debugging

**In IntelliJ**

Open the `package.json` file of the package and debug the `test` script. It will stop in breakpoints you set in the TypeScript code.

**In VS Code:**

To debug tests in VS Code, in the root [`launch.json`](./.vscode/launch.json) file, add a `Node.js: Mocha Tests` configuration by using code assist.
Change the following in the added configuration:

- Change `tdd` to `bdd` under the `args` property
- Add a `cwd` property that points to the package root folder, for example (for `language-server` package): `"cwd": "${workspaceFolder}/packages/language-server",`
- Optionally add the package name to the `name` property

The result should look similar to this:

```json
{
  "type": "node",
  "request": "launch",
  "name": "language-server Mocha Tests",
  "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
  "args": [
    "-u",
    "bdd",
    "--timeout",
    "999999",
    "--colors",
    "${workspaceFolder}/test"
  ],
  "cwd": "${workspaceFolder}/packages/language-server",
  "internalConsoleOptions": "openOnSessionStart",
  "skipFiles": ["<node_internals>/**"]
}
```

When running this launch configuration in VS Code, it will stop in breakpoints you set in the TypeScript code.

### Test Coverage

100%\* Test Coverage is enforced for all productive code in this mono repo.

- Specific statements/functions may be [excluded][ignore_coverage] from the report but the reason for that must
  specified in the source code.

[ignore_coverage]: https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md

### Full Build

To run the full **C**ontinuous **I**ntegration build run `yarn ci` in in either the top level package or a specific subpackage.

### Release Life-Cycle.

This monorepo uses Lerna's [independent][lerna-mode] mode support a separate life-cycle (version number)
for each package and automatically generate the changelog by adhering to [Conventional Commits][cc]

[lerna-mode]: https://github.com/lerna/lerna#independent-mode
[cc]: https://www.conventionalcommits.org/en/v1.0.0/

### Release Process

Performing a release requires push permissions to the repository.

- Ensure you are on `master` branch and synced with origin.
- `yarn run lerna:version`
- Follow the lerna CLI instructions.
- Track the `RELEASE` tag build on circle-ci.
  - https://circleci.com/gh/SAP/ui5-editor-tools.
- Once the tag build has finished successfully inspect the npm registry to see the new versions
  for all the changed packages of this mono-repo.
  - `npm view [package-name] version`
