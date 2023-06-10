import { join } from "path";
import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { Context, getContext } from "@ui5-language-assistant/context";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

import { validatePropertyBindingInfo } from "../../../../../src/services/diagnostics/validators/property-binding-info-validator";
import { issueToSnapshot } from "../../../helper";

describe("property-binding-info-validator", () => {
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
  const getElementByName = (
    name: string,
    elements: XMLElement[] = []
  ): XMLElement | undefined => {
    for (const item of elements) {
      if (item.name === name) {
        return item;
      }
      if (item.subElements.length) {
        return getElementByName(name, item.subElements);
      }
    }
    return;
  };
  const getElementAttributeName = (
    attrName: string,
    elements: XMLAttribute[] = []
  ): XMLAttribute | undefined => {
    for (const item of elements) {
      if (item.key === attrName) {
        return item;
      }
    }
    return;
  };
  beforeAll(async function () {
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
  });
  afterEach(async function () {
    await framework.updateFileContent(viewFilePathSegments, "", {
      doUpdatesAfter: "<content>",
    });
  });
  /**
   * It is considered as context if `customViewId` is not undefined
   */
  const isContext = (input: Context | Error): input is Context => {
    return !!(input as Context).customViewId;
  };
  const fetchContext = async (documentPath: string): Promise<Context> => {
    const context = await getContext(documentPath);
    if (!isContext(context)) {
      throw new Error("getContext throws an error. Check 'getContext'");
    }
    return context;
  };
  const getData = async (
    snippet: string,
    elementName = "Text",
    attrName = "text"
  ): Promise<{
    context: Context;
    attr: XMLAttribute;
  }> => {
    await framework.updateFileContent(viewFilePathSegments, snippet, {
      insertAfter: "<content>",
    });
    const { ast } = await framework.readFile(viewFilePathSegments);
    const element = getElementByName(elementName, ast.rootElement?.subElements);
    const attr = getElementAttributeName(
      attrName,
      element?.attributes
    ) as XMLAttribute;
    const context = await fetchContext(documentPath);
    return { context, attr };
  };
  it("do not check empty string", async () => {
    const snippet = `
    <Text text="" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("do not check {}", async () => {
    const snippet = `
    <Text text="{ }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("do not check {path} [at least a key with colon must exits]", async () => {
    const snippet = `
    <Text text="{path}" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("do not check metadata binding", async () => {
    const snippet = `
    <Input maxLength="{/#Company/ZipCode/@maxLength}"/>`;
    const { attr, context } = await getData(snippet, "Input", "maxLength");
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("do not check simple binding", async () => {
    const snippet = `
   <Input value="{/firstName}"/>`;
    const { attr, context } = await getData(snippet, "Input", "value");
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("do not check aggregation property", async () => {
    const snippet = `
   <List items="{invoice>/Invoices}"> </List>`;
    const { attr, context } = await getData(snippet, "List", "items");
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("do not check resource model", async () => {
    const snippet = `
   <Label labelFor="address" text="{i18n>address}:"/>`;
    const { attr, context } = await getData(snippet, "Label", "text");
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("check unknown char", async () => {
    const snippet = `
    <Text text="{ # path: '' }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: UnknownChar; text: Unknown character; severity:info; range:9:18-9:19",
    ]);
  });
  it("check wrong property binding", async () => {
    const snippet = `
    <Text text="{path: ' ', party }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: UnknownPropertyBindingInfo; text: Unknown property binding info; severity:info; range:9:28-9:33",
    ]);
  });
  it("check missing colon", async () => {
    const snippet = `
    <Text text="{ events: {}, path }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissingColon; text: Expect colon; severity:info; range:9:30-9:34",
    ]);
  });
  it("check missing colon when value exists", async () => {
    const snippet = `
    <Text text="{ path '', events: {}}" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissingColon; text: Expect colon; severity:info; range:9:18-9:22",
    ]);
  });
  it("check missing value", async () => {
    const snippet = `
    <Text text="{ path: }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissingValue; text: Expect ' ' as a value; severity:info; range:9:18-9:23",
    ]);
  });
  it("check wrong value - allowed value are {} or ''", async () => {
    const snippet = `
    <Text text="{ type: 25 }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissMatchValue; text: Allowed values are { } or ' '; severity:info; range:9:24-9:26",
    ]);
  });
  it("check wrong collection value - allowed value are {} or ''", async () => {
    const snippet = `
    <Text text="{ type: [] }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissMatchValue; text: Allowed values are { } or ' '; severity:info; range:9:24-9:26",
    ]);
  });
  it("check wrong value - allowed value is string", async () => {
    const snippet = `
    <Text text="{ path: true }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissMatchValue; text: Allowed value is ' '; severity:info; range:9:24-9:28",
    ]);
  });
  it("check wrong value - allowed value is boolean", async () => {
    const snippet = `
    <Text text="{ suspended: '' }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissMatchValue; text: Allowed values are true or false; severity:info; range:9:29-9:31",
    ]);
  });
  it("check wrong value - allowed value is object", async () => {
    const snippet = `
    <Text text="{ events: true }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissMatchValue; text: Allowed value is { }; severity:info; range:9:26-9:30",
    ]);
  });
  it("check wrong value - allowed value is array", async () => {
    const snippet = `
    <Text text="{ parts: {} }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissMatchValue; text: Allowed values are [{ }] or [' ']; severity:info; range:9:25-9:27",
    ]);
  });
  it("check wrong value - allowed value is array of object or string [array as value is required]", async () => {
    const snippet = `
    <Text text="{ parts: true }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissMatchValue; text: Allowed values are [{ }] or [' ']; severity:info; range:9:25-9:29",
    ]);
  });
  it("check wrong value - allowed value is array of object or string [array as value with wrong content]", async () => {
    const snippet = `
    <Text text="{ parts: [true] }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissMatchValue; text: Allowed values are { } or ' '; severity:info; range:9:26-9:30",
    ]);
  });
  it("do not check structure value - key and its value", async () => {
    const snippet = `
    <Text text="{ events: {anyKeyNotChecked: 'anyValue'} }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("do not check structure value inside collection - key and its value", async () => {
    const snippet = `
    <Text text="{ events: {anyKeyNotChecked: [ {collectionAnyKey: 'anyValue'} ] } }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("do not check structure value - nested key and its value", async () => {
    const snippet = `
    <Text text="{ events: {anyKeyNotChecked: {anotherKey: {nestedKey: [] } } } }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("do not check structure value inside collection - nested key and its value", async () => {
    const snippet = `
    <Text text="{ events: {anyKeyNotChecked: [{anotherKey: [{nestedKey: [] }] }] } }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("do not check structure value inside collection - primitive value", async () => {
    const snippet = `
    <Text text="{ events: {anyKeyNotChecked: [true] } }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("check missing colon in structure value", async () => {
    const snippet = `
    <Text text="{ events: {anyKeyNotChecked} }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissingColon; text: Expect colon; severity:info; range:9:27-9:43",
    ]);
  });
  it("check missing colon in structure value inside collection", async () => {
    const snippet = `
    <Text text="{ events: {anyKeyNotChecked: [{collectionKey}]} }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissingColon; text: Expect colon; severity:info; range:9:47-9:60",
    ]);
  });
  it("check missing colon for collection", async () => {
    const snippet = `
    <Text text="{ events: {}, parts ['one'] }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissingColon; text: Expect colon; severity:info; range:9:30-9:35",
    ]);
  });
  it("check missing colon in nested structure value", async () => {
    const snippet = `
    <Text text="{ events: {anyKeyNotChecked: {anotherKey: {nestedKey } } } }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissingColon; text: Expect colon; severity:info; range:9:59-9:68",
    ]);
  });
  it("check missing value in structure value", async () => {
    const snippet = `
    <Text text="{ events: {anyKeyNotChecked: } }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissingValue; text: Expect a value; severity:info; range:9:27-9:44",
    ]);
  });
  it("check missing value in structure value inside collection", async () => {
    const snippet = `
    <Text text="{ events: {anyKeyNotChecked: [{collectionKey:}]} }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissingValue; text: Expect a value; severity:info; range:9:47-9:61",
    ]);
  });
  it("check missing value in nested structure value", async () => {
    const snippet = `
    <Text text="{ events: {anyKeyNotChecked: {anotherKey: {nestedKey: } } } }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissingValue; text: Expect a value; severity:info; range:9:59-9:69",
    ]);
  });
  it("check duplicate element", async () => {
    const snippet = `
    <Text text="{ path: '', path: '' }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: DuplicateProperty; text: Duplicate property; severity:info; range:9:28-9:32",
    ]);
  });
  it("check nested duplicate element", async () => {
    const snippet = `
    <Text text="{ events: {
      one: {
        abc: '',
        abc: {
          xy: true,
          xy: true
        }
      }
    }}" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: DuplicateProperty; text: Duplicate property; severity:info; range:14:10-14:12",
      "kind: DuplicateProperty; text: Duplicate property; severity:info; range:12:8-12:11",
    ]);
  });
  it("check duplicate element - collection", async () => {
    const snippet = `
    <Text text="{ parts: [{path: '', path: ''}] }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: DuplicateProperty; text: Duplicate property; severity:info; range:9:37-9:41",
    ]);
  });
  it("check nested duplicate element - collection", async () => {
    const snippet = `
    <Text text="{ parts: [
      {
        one: [
          {
            abc: false,
            abc: true
          }
        ],
        one: {}
      }
    ]}" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: UnknownPropertyBindingInfo; text: Unknown property binding info; severity:info; range:11:8-11:11",
      "kind: UnknownPropertyBindingInfo; text: Unknown property binding info; severity:info; range:17:8-17:11",
      "kind: DuplicateProperty; text: Duplicate property; severity:info; range:17:8-17:11",
    ]);
  });
  it("check only one of elements [path, value or parts] is allowed", async () => {
    const snippet = `
    <Text text="{ parts: [''], path: '', value: '' }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: NotAllowedProperty; text: One of these elements [parts, path, value] are allowed; severity:info; range:9:18-9:23",
      "kind: NotAllowedProperty; text: One of these elements [parts, path, value] are allowed; severity:info; range:9:31-9:35",
      "kind: NotAllowedProperty; text: One of these elements [parts, path, value] are allowed; severity:info; range:9:41-9:46",
    ]);
  });
  it("check only one of elements [path, value or parts] is allowed - nested", async () => {
    const snippet = `
    <Text text="{ parts: [
      {
        path: '', value: ''
      }
    ]}" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: NotAllowedProperty; text: One of these elements [path, value] are allowed; severity:info; range:11:8-11:12",
      "kind: NotAllowedProperty; text: One of these elements [path, value] are allowed; severity:info; range:11:18-11:23",
    ]);
  });
  it("check dependent element", async () => {
    const snippet = `
    <Text text="{formatOptions: {}}" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      'kind: RequiredDependency; text: Required dependency "type" MUST be defined; severity:info; range:9:17-9:30',
    ]);
  });
  it("check required element has correct value", async () => {
    const snippet = `
    <Text text="{formatOptions: {}, type: {}}" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      'kind: RequiredDependency; text: "formatOptions" is allowed with "type" when "type" is defined as \' \'; severity:info; range:9:17-9:30',
    ]);
  });
  it("check recursive composite bindings", async () => {
    const snippet = `
    <Text text="{parts: [{
      parts: []
    }]}" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissingValue; text: Required values { } or ' ' must be provided; severity:info; range:10:13-10:15",
      "kind: RecursiveProperty; text: Recursive composite bindings is not allowed; severity:info; range:10:6-10:11",
    ]);
  });
  describe("parts", () => {
    it("check recursive composite bindings - nested", async () => {
      const snippet = `
    <Text text="{parts: [{
      p: [
        {
            parts: []
        }
      ]
    }]}" id="test-id"></Text>`;
      const { attr, context } = await getData(snippet);
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: UnknownPropertyBindingInfo; text: Unknown property binding info; severity:info; range:10:6-10:7",
        "kind: RecursiveProperty; text: Recursive composite bindings is not allowed; severity:info; range:12:12-12:17",
      ]);
    });
    it("check wrong property binding", async () => {
      const snippet = `
    <Text text="{ parts: [{ party }] }" id="test-id"></Text>`;
      const { attr, context } = await getData(snippet);
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: UnknownPropertyBindingInfo; text: Unknown property binding info; severity:info; range:9:28-9:33",
      ]);
    });
    it("check missing colon", async () => {
      const snippet = `
    <Text text="{ parts: [{ path }] }" id="test-id"></Text>`;
      const { attr, context } = await getData(snippet);
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: MissingColon; text: Expect colon; severity:info; range:9:28-9:32",
      ]);
    });
    it("check missing value", async () => {
      const snippet = `
    <Text text="{ parts: [{ path: } }" id="test-id"></Text>`;
      const { attr, context } = await getData(snippet);
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: MissingValue; text: Expect ' ' as a value; severity:info; range:9:28-9:33",
      ]);
    });
    it("check missing comma [parts]", async () => {
      const snippet = `
    <Text text="{ parts: [{ path: '' events: {} }}" id="test-id"></Text>`;
      const { attr, context } = await getData(snippet);
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: MissingComma; text: Missing comma; severity:info; range:9:37-9:47",
      ]);
    });
    it("check missing comma for elements [parts]", async () => {
      const snippet = `
    <Text text="{ parts: [{ path: '01'} {path: '02'}]}" id="test-id"></Text>`;
      const { attr, context } = await getData(snippet);
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: MissingComma; text: Missing comma; severity:info; range:9:40-9:52",
      ]);
    });
    it("check trailing comma [parts]", async () => {
      const snippet = `
    <Text text="{ parts: [{ path: ''}, ]}" id="test-id"></Text>`;
      const { attr, context } = await getData(snippet);
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: TrailingComma; text: Trailing comma; severity:info; range:9:37-9:38",
      ]);
    });
    it("check empty collection", async () => {
      const snippet = `
    <Text text="{ parts: []}" id="test-id"></Text>`;
      const { attr, context } = await getData(snippet);
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: MissingValue; text: Required values { } or ' ' must be provided; severity:info; range:9:25-9:27",
      ]);
    });
    it("check collection with empty object", async () => {
      const snippet = `
    <Text text="{ parts: [{}]}" id="test-id"></Text>`;
      const { attr, context } = await getData(snippet);
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: MissingValue; text: A valid binding property info must be provided for "{}"; severity:info; range:9:26-9:28',
      ]);
    });
    it("check collection with mixed data", async () => {
      const snippet = `
    <Text text="{ parts: [{path: ' '}, '']}" id="test-id"></Text>`;
      const { attr, context } = await getData(snippet);
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
    });
    it("check nested collection", async () => {
      const snippet = `
    <Text text="{ parts: [[]]}" id="test-id"></Text>`;
      const { attr, context } = await getData(snippet);
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: MissingValue; text: Nested "[]" are not allowed; severity:info; range:9:26-9:28',
      ]);
    });
    it("check wrong value", async () => {
      const snippet = `
    <Text text="{ parts: '' }" id="test-id"></Text>`;
      const { attr, context } = await getData(snippet);
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: MissMatchValue; text: Allowed values are [{ }] or [' ']; severity:info; range:9:25-9:27",
      ]);
    });
  });
  it("check missing comma", async () => {
    const snippet = `
    <Text text="{ path: '' events:{} }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissingComma; text: Missing comma; severity:info; range:9:27-9:36",
    ]);
  });
  it("check trailing comma", async () => {
    const snippet = `
    <Text text="{ path: '', events:{}, }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: TrailingComma; text: Trailing comma; severity:info; range:9:37-9:38",
    ]);
  });
  it("check too many commas", async () => {
    const snippet = `
    <Text text="{ path: '',,,, events:{} }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: TooManyCommas; text: Too many commas; severity:info; range:9:27-9:30",
    ]);
  });
  it("check too many colon", async () => {
    const snippet = `
    <Text text="{ path::::: '', events:{} }" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: TooManyColons; text: Too many colon; severity:info; range:9:23-9:24",
    ]);
  });
  it("check too many object", async () => {
    const snippet = `
    <Text text="{events: {{}}}" id="test-id"></Text>`;
    const { attr, context } = await getData(snippet);
    const result = validatePropertyBindingInfo(attr, context);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: Syntax; text: Expecting --> } <-- but found --> '{' <--; severity:info; range:9:26-9:27",
    ]);
  });
  describe("multiple binding", () => {
    it("check no unwanted error with text", async () => {
      const snippet = `
     <Label text="Hello Mr. {path: '/employees/0/lastName'}, {path: '/employees/0/firstName', formatter:'.myFormatter'}"/>`;
      const { attr, context } = await getData(snippet, "Label", "text");
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
    });
    it("check no unwanted error with special chars", async () => {
      const snippet = `
     <Label text="### {path: '/employees/0/lastName'} / {path: '/employees/0/firstName', formatter:'.myFormatter'}"/> $$$`;
      const { attr, context } = await getData(snippet, "Label", "text");
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
    });
    it("check no unwanted error with escaped chars", async () => {
      const snippet = `
     <Label text="\\{ \\[ {path: 'test-value-01'} \\{ {path: 'test-value-02' }\\] \\}"/>`;
      const { attr, context } = await getData(snippet, "Label", "text");
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
    });
    it("check no unwanted error with text, escaped and special chars", async () => {
      const snippet = `
     <Input value="abc \\{ { path: ''} ###### { parts: [{path: ''}]}"/>`;
      const { attr, context } = await getData(snippet, "Input", "value");
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
    });
    it("check correct range for diagnostics with text, escaped and special chars", async () => {
      const snippet = `
     <Input value="abc \\{ { path: } ###### { parts: [{path ''}]}"/>`;
      const { attr, context } = await getData(snippet, "Input", "value");
      const result = validatePropertyBindingInfo(attr, context);
      expect(result.map((item) => issueToSnapshot(item)))
        .toMatchInlineSnapshot(`
        Array [
          "kind: MissingValue; text: Expect ' ' as a value; severity:info; range:9:28-9:33",
          "kind: MissingColon; text: Expect colon; severity:info; range:9:54-9:58",
        ]
      `);
    });
  });
});
