# SAPUI5 Language Support

This VS Code extension provides SAPUI5 language editor support.

## Features

### XML Views Auto-Complete/Context-Assist

![](./resources/preview-content-assist.gif)

#### Description

The tool provides the following support:

- Relevant filters to suggestions. For example:

  - Only classes that match the parent aggregation's **type** are offered.
  - In a "full" aggregation with cardinality `0..1`, no more suggestions are made.
  - Only classes inside the `xmlns` prefix used are offered.
  - Deprecated and experimental SAPUI5 nodes are not be offered by default (configurable).

- Additional text for ease of use. For example:

  - Auto-insertion of name for closing tags for classes and aggregations.
  - Auto-insertion of `=""` for attribute key suggestions.
  - Auto-insertion of the `xmlns` prefix for classes and aggregation tags.

- Tooltips displayed while browsing the suggestions including a clickable link to the SAPUI5 SDK (Demo Kit).

#### Availability

The feature is available in the following:

- XML tags:

  - Classes
  - Aggregations

- XML attribute keys:

  - Properties
  - Events
  - Associations
  - Namespace prefixes

- XML attribute values:
  - Enum values
  - Boolean values
  - Namespaces fully qualified names

### XML View Validations

![](./resources/preview-validations.gif)

#### Description

The list of validations and their severity are currently hard-coded
and cannot be configured by the end user.

#### Validation List

- Errors:

  - Invalid boolean values
  - Unknown attribute keys
  - Unknown `eum` values
  - Unknown `xmlns` namespace
  - Unknown tag names
  - No unique tag IDs
  - Wrong cardinality of aggregation
  - Wrong type of tags inside aggregations

- Warnings:

  - Use of deprecated classes
  - Use of deprecated aggregations
  - Use of deprecated properties
  - Use of deprecated events
  - Use of deprecated associations

### XML View Hover Tooltips

![](./resources/preview-hover-tooltips.gif)

#### Description

Tooltips will be shown when hovering over an item.

#### Availability

The feature is available in the following:

- XML tags:

  - Classes
  - Aggregations

- XML attribute keys:
 
 - Properties
  - Events
  - Associations
  - Aggregations

- XML attribute values:

  - Enum values
  - SAPUI5 Namespaces
 

## Installation

### From the VS Code Marketplace

In the [UI5 Language Assistant](https://marketplace.visualstudio.com/items?itemName=SAPOSS.ui5-language-assistant) VS Code marketplace page, click **Install**.


### From GitHub Releases

1. Go to [GitHub Releases](https://github.com/sap/ui5-language-assistant/releases).
2. Search for the `.vsix` archive under `ui5-language-assist\@x.y.z` releases. (Replace `x.y.z` with the desired version number.)
3. Follow the instructions for installing an extension from a `.vsix` file in the [VSCode's guide](https://code.visualstudio.com/docs/editor/extension-gallery#_install-from-a-vsix).

### Usage

This extension's features are automatically enabled when opening/editing relevant SAPUI5 source files.
For SAPUI5 XML views, this means:`*.view.xml` or `*.fragment.xml` files.

Note that the extension **lazily** downloads the SAPUI5 metadata needed for its features.
This means that there may be a delay between starting VS Code and having the relevant features available.

### Limitations

#### SAPUI5 version

This extension currently uses a hard-coded (1.71.x) version for the SAPUI5 metadata.

#### Custom controls

This extension does not currently support custom controls, some features, such as validations,
may use heuristics to guess that a tag is a custom control. However, no auto-complete is currently offered
for custom controls.

### Support

You can open [issues](https://github.com/SAP/ui5-language-assistant/issues) on GitHub.

### Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

### License

Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the [LICENSE file](../../LICENSE).
