import { expect } from "chai";
import { join } from "path";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
  CURSOR_ANCHOR,
} from "@ui5-language-assistant/test-framework";
import { Settings } from "@ui5-language-assistant/settings";

import {
  completionItemToSnapshot,
  getViewCompletionProvider,
  ViewCompletionProviderType,
} from "../../helper";

describe("index", () => {
  let getCompletionResult: ViewCompletionProviderType;
  let framework: TestFramework;
  let root: string, documentPath: string;
  const viewFilePathSegments = [
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml",
  ];
  const settings: Settings = {
    codeAssist: {
      deprecated: false,
      experimental: false,
    },
    logging: {
      level: "off",
    },
    trace: {
      server: "off",
    },
  };

  before(async function () {
    const timeout = 5 * 60000 + 8000; // 5 min for initial npm install + 8 sec
    this.timeout(timeout);
    const config: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: true,
        deleteBeforeCopy: false,
      },
    };
    framework = new TestFramework(config);

    root = framework.getProjectRoot();
    documentPath = join(root, ...viewFilePathSegments);
    const uri = framework.getFileUri([root, ...viewFilePathSegments]);
    getCompletionResult = getViewCompletionProvider(
      framework,
      viewFilePathSegments,
      documentPath,
      uri,
      settings
    );
  });
  context("getCompletionItems", () => {
    it("provides CC consider string value as double quote", async function () {
      const snippet = `
        <Text text='{path: ${CURSOR_ANCHOR}}' id="test-id"></Text>`;
      const result = await getCompletionResult(snippet, this);
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).to.deep.equal([
        'label: " "; text: " "; kind:5; commit:undefined; sort:',
      ]);
    });
    it("provides CC consider string value as single quote", async function () {
      const snippet = `
        <Text text="{path: ${CURSOR_ANCHOR}}" id="test-id"></Text>`;
      const result = await getCompletionResult(snippet, this);
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).to.deep.equal([
        "label: ' '; text: ' '; kind:5; commit:undefined; sort:",
      ]);
    });
    it("provides CC for initial", async function () {
      const snippet = `
        <Text text="${CURSOR_ANCHOR}" id="test-id"></Text>`;
      const result = await getCompletionResult(snippet, this);
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).to.deep.equal([
        "label: { }; text: { ${1|path,value,model,suspended,formatter,useRawValues,useInternalValues,type,targetType,formatOptions,constraints,mode,parameters,events,parts|}: ${2|' ',{ },[{ }],[''],true,false|}$0 }; kind:15; commit:undefined; sort:",
        "label: {= }; text: {= $0 }; kind:15; commit:undefined; sort:",
        "label: {:= }; text: {:= $0 }; kind:15; commit:undefined; sort:",
      ]);
    });
    it("provides CC for empty", async function () {
      const snippet = `
        <Text text="{${CURSOR_ANCHOR}}" id="test-id"></Text>`;
      const result = await getCompletionResult(snippet, this);
      expect(
        result.map((item) => completionItemToSnapshot(item, true))
      ).to.deep.equal([
        "label: path; text: path: ' '; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Path in the model to bind to, either an absolute path or relative to the binding context for the corresponding model; when the path contains a '>' sign, the string preceding it will override the model property and the remainder after the '>' will be used as binding path \n\n **Visibility:** Public",
        "label: value; text: value: ' '; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Since 1.61, defines a static binding with the given value \n\n **Visibility:** Public",
        "label: model; text: model: ' '; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Name of the model to bind against; when undefined or omitted, the default model is used \n\n **Visibility:** Public",
        "label: suspended; text: suspended: ${1|true,false|}$0; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Whether the binding should be suspended initially \n\n **Visibility:** Public",
        "label: formatter; text: formatter: ' '; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Function to convert model data into a property value \n\n **Visibility:** Public",
        "label: useRawValues; text: useRawValues: ${1|true,false|}$0; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Whether the parameters to the formatter function should be passed as raw values. In this case the specified types for the binding parts are not used and the values are not formatted.\n**Note**: use this flag only when using multiple bindings. If you use only one binding and want raw values then simply don't specify a type for that binding \n\n **Visibility:** Public",
        "label: useInternalValues; text: useInternalValues: ${1|true,false|}$0; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Whether the parameters to the formatter function should be passed as the related JavaScript primitive values. In this case the values of the model are parsed by the model format of the specified types from the binding parts.\n**Note**: use this flag only when using multiple bindings. \n\n **Visibility:** Public",
        'label: type; text: type: ${1|{ },\' \'|}$0; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** A type object or the name of a type class to create such a type object; the type will be used for converting model data to a property value (aka "formatting") and vice versa (in binding mode TwoWay, aka "parsing") \n\n **Visibility:** Public',
        'label: targetType; text: targetType: \' \'; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Target type to be used by the type when formatting model data, for example "boolean" or "string" or "any"; defaults to the property\'s type \n\n **Visibility:** Public',
        "label: formatOptions; text: formatOptions: { }; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Format options to be used for the type; only taken into account when the type is specified by its name - a given type object won't be modified \n\n **Visibility:** Public",
        "label: constraints; text: constraints: { }; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Additional constraints to be used when constructing a type object from a type name, ignored when a type object is given \n\n **Visibility:** Public",
        "label: mode; text: mode: { }; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Binding mode to be used for this property binding (e.g. one way) \n\n **Visibility:** Public",
        "label: parameters; text: parameters: { }; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Map of additional parameters for this binding; the names and value ranges of the supported parameters depend on the model implementation, they should be documented with the bindProperty method of the corresponding model class or with the model specific subclass of sap.ui.model.PropertyBinding \n\n **Visibility:** Public",
        "label: events; text: events: { }; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Map of event handler functions keyed by the name of the binding events that they should be attached to \n\n **Visibility:** Public",
        "label: parts; text: parts: ${1|[{ }],[' ']|}$0; kind:15; commit:undefined; sort:; documentation: kind:markdown,value:**Description:** Array of binding info objects for the parts of a composite binding; the structure of each binding info is the same as described for the oBindingInfo as a whole.\nIf a part is not specified as a binding info object but as a simple string, a binding info object will be created with that string as path. The string may start with a model name prefix (see property path).\n**Note**: recursive composite bindings are currently not supported. Therefore, a part must not contain a parts property \n\n **Visibility:** Public",
      ]);
    });
    context("provides CC for key", () => {
      it("a. `<CURSOR>`path", async function () {
        const snippet = `
        <Text text="{${CURSOR_ANCHOR}path, events:{}}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: path; text: path; kind:5; commit:undefined; sort:; textEdit: {newText: path, range: 9:21-9:25}",
          "label: value; text: value; kind:5; commit:undefined; sort:; textEdit: {newText: value, range: 9:21-9:25}",
          "label: model; text: model; kind:5; commit:undefined; sort:; textEdit: {newText: model, range: 9:21-9:25}",
          "label: suspended; text: suspended; kind:5; commit:undefined; sort:; textEdit: {newText: suspended, range: 9:21-9:25}",
          "label: formatter; text: formatter; kind:5; commit:undefined; sort:; textEdit: {newText: formatter, range: 9:21-9:25}",
          "label: useRawValues; text: useRawValues; kind:5; commit:undefined; sort:; textEdit: {newText: useRawValues, range: 9:21-9:25}",
          "label: useInternalValues; text: useInternalValues; kind:5; commit:undefined; sort:; textEdit: {newText: useInternalValues, range: 9:21-9:25}",
          "label: type; text: type; kind:5; commit:undefined; sort:; textEdit: {newText: type, range: 9:21-9:25}",
          "label: targetType; text: targetType; kind:5; commit:undefined; sort:; textEdit: {newText: targetType, range: 9:21-9:25}",
          "label: formatOptions; text: formatOptions; kind:5; commit:undefined; sort:; textEdit: {newText: formatOptions, range: 9:21-9:25}",
          "label: constraints; text: constraints; kind:5; commit:undefined; sort:; textEdit: {newText: constraints, range: 9:21-9:25}",
          "label: mode; text: mode; kind:5; commit:undefined; sort:; textEdit: {newText: mode, range: 9:21-9:25}",
          "label: parameters; text: parameters; kind:5; commit:undefined; sort:; textEdit: {newText: parameters, range: 9:21-9:25}",
          "label: events; text: events; kind:5; commit:undefined; sort:; textEdit: {newText: events, range: 9:21-9:25}",
          "label: parts; text: parts; kind:5; commit:undefined; sort:; textEdit: {newText: parts, range: 9:21-9:25}",
        ]);
      });
      it("b. keyProperty`<CURSOR>`", async function () {
        const snippet = `
        <Text text="{ path${CURSOR_ANCHOR}, events: {} }" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: path; text: path; kind:5; commit:undefined; sort:; textEdit: {newText: path, range: 9:22-9:26}",
          "label: value; text: value; kind:5; commit:undefined; sort:; textEdit: {newText: value, range: 9:22-9:26}",
          "label: model; text: model; kind:5; commit:undefined; sort:; textEdit: {newText: model, range: 9:22-9:26}",
          "label: suspended; text: suspended; kind:5; commit:undefined; sort:; textEdit: {newText: suspended, range: 9:22-9:26}",
          "label: formatter; text: formatter; kind:5; commit:undefined; sort:; textEdit: {newText: formatter, range: 9:22-9:26}",
          "label: useRawValues; text: useRawValues; kind:5; commit:undefined; sort:; textEdit: {newText: useRawValues, range: 9:22-9:26}",
          "label: useInternalValues; text: useInternalValues; kind:5; commit:undefined; sort:; textEdit: {newText: useInternalValues, range: 9:22-9:26}",
          "label: type; text: type; kind:5; commit:undefined; sort:; textEdit: {newText: type, range: 9:22-9:26}",
          "label: targetType; text: targetType; kind:5; commit:undefined; sort:; textEdit: {newText: targetType, range: 9:22-9:26}",
          "label: formatOptions; text: formatOptions; kind:5; commit:undefined; sort:; textEdit: {newText: formatOptions, range: 9:22-9:26}",
          "label: constraints; text: constraints; kind:5; commit:undefined; sort:; textEdit: {newText: constraints, range: 9:22-9:26}",
          "label: mode; text: mode; kind:5; commit:undefined; sort:; textEdit: {newText: mode, range: 9:22-9:26}",
          "label: parameters; text: parameters; kind:5; commit:undefined; sort:; textEdit: {newText: parameters, range: 9:22-9:26}",
          "label: events; text: events; kind:5; commit:undefined; sort:; textEdit: {newText: events, range: 9:22-9:26}",
          "label: parts; text: parts; kind:5; commit:undefined; sort:; textEdit: {newText: parts, range: 9:22-9:26}",
        ]);
      });
      it("c. key`<CURSOR>`Property", async function () {
        const snippet = `
        <Text text="{ pa${CURSOR_ANCHOR}th, events: {} }" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: path; text: path; kind:5; commit:undefined; sort:; textEdit: {newText: path, range: 9:22-9:26}",
          "label: value; text: value; kind:5; commit:undefined; sort:; textEdit: {newText: value, range: 9:22-9:26}",
          "label: model; text: model; kind:5; commit:undefined; sort:; textEdit: {newText: model, range: 9:22-9:26}",
          "label: suspended; text: suspended; kind:5; commit:undefined; sort:; textEdit: {newText: suspended, range: 9:22-9:26}",
          "label: formatter; text: formatter; kind:5; commit:undefined; sort:; textEdit: {newText: formatter, range: 9:22-9:26}",
          "label: useRawValues; text: useRawValues; kind:5; commit:undefined; sort:; textEdit: {newText: useRawValues, range: 9:22-9:26}",
          "label: useInternalValues; text: useInternalValues; kind:5; commit:undefined; sort:; textEdit: {newText: useInternalValues, range: 9:22-9:26}",
          "label: type; text: type; kind:5; commit:undefined; sort:; textEdit: {newText: type, range: 9:22-9:26}",
          "label: targetType; text: targetType; kind:5; commit:undefined; sort:; textEdit: {newText: targetType, range: 9:22-9:26}",
          "label: formatOptions; text: formatOptions; kind:5; commit:undefined; sort:; textEdit: {newText: formatOptions, range: 9:22-9:26}",
          "label: constraints; text: constraints; kind:5; commit:undefined; sort:; textEdit: {newText: constraints, range: 9:22-9:26}",
          "label: mode; text: mode; kind:5; commit:undefined; sort:; textEdit: {newText: mode, range: 9:22-9:26}",
          "label: parameters; text: parameters; kind:5; commit:undefined; sort:; textEdit: {newText: parameters, range: 9:22-9:26}",
          "label: events; text: events; kind:5; commit:undefined; sort:; textEdit: {newText: events, range: 9:22-9:26}",
          "label: parts; text: parts; kind:5; commit:undefined; sort:; textEdit: {newText: parts, range: 9:22-9:26}",
        ]);
      });
    });
    context("provides CC for value", () => {
      it("a. keyProperty: `<CURSOR>`", async function () {
        const snippet = `
        <Text text="{path: ${CURSOR_ANCHOR}}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: ' '; text: ' '; kind:5; commit:undefined; sort:",
        ]);
      });
      it("b. keyProperty: `<CURSOR>`'value-for-this-key'", async function () {
        const snippet = `
        <Text text="{path: ${CURSOR_ANCHOR}' '}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([]);
      });
      it("c. keyProperty: `<CURSOR>`  'value-for-this-key' [space]", async function () {
        const snippet = `
        <Text text="{path: ${CURSOR_ANCHOR} ' '}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([]);
      });
      it("d. keyProperty: 'value-for`<CURSOR>`-this-key'", async function () {
        const snippet = `
        <Text text="{path: 'a-value-${CURSOR_ANCHOR}for-test'}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([]);
      });
      it("e. keyProperty: 'value-for-this-key'`<CURSOR>`", async function () {
        const snippet = `
        <Text text="{path: 'a-value-for-test'${CURSOR_ANCHOR}}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([]);
      });
      it("f. for boolean value", async function () {
        const snippet = `
        <Text text="{useRawValues: true${CURSOR_ANCHOR}}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: false; text: false; kind:5; commit:undefined; sort:; textEdit: {newText: false, range: 9:35-9:39}",
          "label: true; text: true; kind:5; commit:undefined; sort:; textEdit: {newText: true, range: 9:35-9:39}",
        ]);
      });
      it("g. for parts only [empty collection]", async function () {
        const snippet = `
        <Text text="{parts: [ ${CURSOR_ANCHOR} ]}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: { }; text: { }; kind:5; commit:undefined; sort:",
          "label: ' '; text: ' '; kind:5; commit:undefined; sort:",
        ]);
      });
      it("h. for parts only [all binding info properties except parts itself]", async function () {
        const snippet = `
        <Text text="{parts: [{${CURSOR_ANCHOR}}]}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: path; text: path: ' '; kind:15; commit:undefined; sort:",
          "label: value; text: value: ' '; kind:15; commit:undefined; sort:",
          "label: model; text: model: ' '; kind:15; commit:undefined; sort:",
          "label: suspended; text: suspended: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: formatter; text: formatter: ' '; kind:15; commit:undefined; sort:",
          "label: useRawValues; text: useRawValues: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: useInternalValues; text: useInternalValues: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: type; text: type: ${1|{ },' '|}$0; kind:15; commit:undefined; sort:",
          "label: targetType; text: targetType: ' '; kind:15; commit:undefined; sort:",
          "label: formatOptions; text: formatOptions: { }; kind:15; commit:undefined; sort:",
          "label: constraints; text: constraints: { }; kind:15; commit:undefined; sort:",
          "label: mode; text: mode: { }; kind:15; commit:undefined; sort:",
          "label: parameters; text: parameters: { }; kind:15; commit:undefined; sort:",
          "label: events; text: events: { }; kind:15; commit:undefined; sort:",
        ]);
      });
    });
    context("provides CC for key value", () => {
      it("a. keyProperty: 'value-for-this-key'  `<CURSOR>` [spaces]", async function () {
        const snippet = `
        <Text text="{path: 'value-for-this-key' ${CURSOR_ANCHOR}}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: value; text: value: ' '; kind:15; commit:undefined; sort:",
          "label: model; text: model: ' '; kind:15; commit:undefined; sort:",
          "label: suspended; text: suspended: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: formatter; text: formatter: ' '; kind:15; commit:undefined; sort:",
          "label: useRawValues; text: useRawValues: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: useInternalValues; text: useInternalValues: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: type; text: type: ${1|{ },' '|}$0; kind:15; commit:undefined; sort:",
          "label: targetType; text: targetType: ' '; kind:15; commit:undefined; sort:",
          "label: formatOptions; text: formatOptions: { }; kind:15; commit:undefined; sort:",
          "label: constraints; text: constraints: { }; kind:15; commit:undefined; sort:",
          "label: mode; text: mode: { }; kind:15; commit:undefined; sort:",
          "label: parameters; text: parameters: { }; kind:15; commit:undefined; sort:",
          "label: events; text: events: { }; kind:15; commit:undefined; sort:",
          "label: parts; text: parts: ${1|[{ }],[' ']|}$0; kind:15; commit:undefined; sort:",
        ]);
      });
      it("b. keyProperty: 'value-for-this-key', `<CURSOR>` [comma]", async function () {
        const snippet = `
        <Text text="{path: 'value-for-this-key', ${CURSOR_ANCHOR}}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: value; text: value: ' '; kind:15; commit:undefined; sort:",
          "label: model; text: model: ' '; kind:15; commit:undefined; sort:",
          "label: suspended; text: suspended: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: formatter; text: formatter: ' '; kind:15; commit:undefined; sort:",
          "label: useRawValues; text: useRawValues: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: useInternalValues; text: useInternalValues: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: type; text: type: ${1|{ },' '|}$0; kind:15; commit:undefined; sort:",
          "label: targetType; text: targetType: ' '; kind:15; commit:undefined; sort:",
          "label: formatOptions; text: formatOptions: { }; kind:15; commit:undefined; sort:",
          "label: constraints; text: constraints: { }; kind:15; commit:undefined; sort:",
          "label: mode; text: mode: { }; kind:15; commit:undefined; sort:",
          "label: parameters; text: parameters: { }; kind:15; commit:undefined; sort:",
          "label: events; text: events: { }; kind:15; commit:undefined; sort:",
          "label: parts; text: parts: ${1|[{ }],[' ']|}$0; kind:15; commit:undefined; sort:",
        ]);
      });
      it("c. `<CURSOR>` keyProperty: 'value-for-this-key'", async function () {
        const snippet = `
        <Text text="{${CURSOR_ANCHOR} path: 'value-for-this-key'}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: value; text: value: ' '; kind:15; commit:undefined; sort:",
          "label: model; text: model: ' '; kind:15; commit:undefined; sort:",
          "label: suspended; text: suspended: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: formatter; text: formatter: ' '; kind:15; commit:undefined; sort:",
          "label: useRawValues; text: useRawValues: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: useInternalValues; text: useInternalValues: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: type; text: type: ${1|{ },' '|}$0; kind:15; commit:undefined; sort:",
          "label: targetType; text: targetType: ' '; kind:15; commit:undefined; sort:",
          "label: formatOptions; text: formatOptions: { }; kind:15; commit:undefined; sort:",
          "label: constraints; text: constraints: { }; kind:15; commit:undefined; sort:",
          "label: mode; text: mode: { }; kind:15; commit:undefined; sort:",
          "label: parameters; text: parameters: { }; kind:15; commit:undefined; sort:",
          "label: events; text: events: { }; kind:15; commit:undefined; sort:",
          "label: parts; text: parts: ${1|[{ }],[' ']|}$0; kind:15; commit:undefined; sort:",
        ]);
      });
      it("d. keyProperty: 'value-for-this-key',`<CURSOR>`, [between comma]", async function () {
        const snippet = `
        <Text text="{path: 'value-for-this-key', ${CURSOR_ANCHOR} ,}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: value; text: value: ' '; kind:15; commit:undefined; sort:",
          "label: model; text: model: ' '; kind:15; commit:undefined; sort:",
          "label: suspended; text: suspended: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: formatter; text: formatter: ' '; kind:15; commit:undefined; sort:",
          "label: useRawValues; text: useRawValues: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: useInternalValues; text: useInternalValues: ${1|true,false|}$0; kind:15; commit:undefined; sort:",
          "label: type; text: type: ${1|{ },' '|}$0; kind:15; commit:undefined; sort:",
          "label: targetType; text: targetType: ' '; kind:15; commit:undefined; sort:",
          "label: formatOptions; text: formatOptions: { }; kind:15; commit:undefined; sort:",
          "label: constraints; text: constraints: { }; kind:15; commit:undefined; sort:",
          "label: mode; text: mode: { }; kind:15; commit:undefined; sort:",
          "label: parameters; text: parameters: { }; kind:15; commit:undefined; sort:",
          "label: events; text: events: { }; kind:15; commit:undefined; sort:",
          "label: parts; text: parts: ${1|[{ }],[' ']|}$0; kind:15; commit:undefined; sort:",
        ]);
      });
    });
    context("provides CC for colon context", () => {
      it("a. keyProperty `<CURSOR>` 'value-for-this-key'", async function () {
        const snippet = `
        <Text text="{path ${CURSOR_ANCHOR} 'value-for-this-key'" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([]);
      });
      it("b. keyProperty `<CURSOR>` [space(s)] [cc for value]", async function () {
        const snippet = `
        <Text text="{path ${CURSOR_ANCHOR}, events:{}}" id="test-id"></Text>`;
        const result = await getCompletionResult(snippet, this);
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: ' '; text: ' '; kind:5; commit:undefined; sort:",
        ]);
      });
    });
  });
});
