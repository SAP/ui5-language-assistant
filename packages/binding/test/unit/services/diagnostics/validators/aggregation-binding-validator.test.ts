import { join } from "path";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

import { validateBinding } from "../../../../../src/services/diagnostics/validators/binding-validator";
import {
  issueToSnapshot,
  ViewValidatorType,
  getViewValidator,
} from "../../../helper";

describe("aggregation binding", () => {
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
  let validateView: ViewValidatorType;
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
    validateView = getViewValidator(
      framework,
      viewFilePathSegments,
      documentPath,
      validateBinding
    );
  });

  it("check wrong value - integer", async () => {
    const snippet = `
    <List items="{startIndex: ''}"> </List>`;
    const result = await validateView(snippet);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissMatchValue; text: Allowed value is integer; severity:error; range:9:30-9:32",
    ]);
  });
  describe("structure", () => {
    it("check wrong value", async () => {
      const snippet = `
        <List items="{filters: {condition: ''}}"> </List>`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: MissMatchValue; text: Allowed value is { }; severity:error; range:9:43-9:45",
      ]);
    });
    it("check wrong value - deep nested", async () => {
      const snippet = `
        <List items="{
          filters: {
              condition: {
                  filters: [{
                          condition: ''
                      }]
                  }
              }
          }"></List>`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: MissMatchValue; text: Allowed value is { }; severity:error; range:13:37-13:39",
      ]);
    });
  });
  describe("collection", () => {
    it("check unknown aggregation - nested", async () => {
      const snippet = `
      <List items="{
        filters: [{
            filters: [{
                conditionXYZ: {}
            }]
        }]
      }" />`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: UnknownPropertyBindingInfo; text: Unknown aggregation binding; severity:error; range:12:16-12:28",
      ]);
    });
    it("check unknown aggregation - sorter", async () => {
      const snippet = `
      <List items="{
        sorter: [{
            paths: ''
        }]
      }" />`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: UnknownPropertyBindingInfo; text: Unknown aggregation binding; severity:error; range:11:12-11:17",
      ]);
    });
  });
  it("no diagnostic for empty collection - filters", async () => {
    const snippet = `
    <List items="{filters: []}"> </List>`;
    const result = await validateView(snippet);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("no diagnostic for empty collection - sorter", async () => {
    const snippet = `
    <List items="{sorter: []}"> </List>`;
    const result = await validateView(snippet);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  describe("no diagnostic for any type - value2", () => {
    it("primitive", async () => {
      const snippet = `
        <List
          items="{
              filters: {
                  value2: 123
              }
            }"
        />`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
    });
    it("structure", async () => {
      const snippet = `
        <List
          items="{
              filters: {
                  value2: {}
              }
            }"
        />`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
    });
    it("collection", async () => {
      const snippet = `
        <List
          items="{
              filters: {
                  value2: []
              }
            }"
        />`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
    });
  });
  it.todo("required dependency - value1");
});
