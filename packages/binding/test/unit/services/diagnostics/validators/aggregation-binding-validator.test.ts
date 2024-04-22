import { join } from "path";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

import { validateBinding } from "../../../../../src/services/diagnostics/validators/binding-validator";
import { initI18n } from "../../../../../src/i18n";
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
    const i18n = await framework.initI18n();
    initI18n(i18n);
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
    <List items="{startIndex: '', path: 'test-path'}"> </List>`;
    const result = await validateView(snippet);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
      "kind: MissMatchValue; text: Allowed value is integer; severity:error; range:9:30-9:32",
    ]);
  });
  describe("structure", () => {
    it("check wrong value", async () => {
      const snippet = `
        <List items="{filters: {condition: '', operator: 'All'}, path: 'test-path'}"> </List>`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: MissMatchValue; text: Allowed value is { }; severity:error; range:9:43-9:45",
      ]);
    });
    it("check wrong value - deep nested", async () => {
      const snippet = `
        <List items="{
            path: 'test-path',
            filters: {
                operator: 'All',
                condition: {
                    filters: [{
                        operator: 'Any',
                        condition: ''
                    }]
                }
            }
        }"
        />`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: MissMatchValue; text: Allowed value is { }; severity:error; range:16:35-16:37",
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
        }],
        path: 'test-path'
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
            path: 'test-path',
            groups: true
        }],
        path: 'test-path'
      }" />`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: UnknownPropertyBindingInfo; text: Unknown aggregation binding; severity:error; range:12:12-12:18",
      ]);
    });
    it("check trailing comma aggregation - sorter or filters", async () => {
      const snippet = `
      <List items="{
        filters: [{
            path: 'test-path',
            operator: 'BT',
            value2: 'C',
        }],
        path: 'test-path'
      }" />`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: TrailingComma; text: Trailing ','; severity:error; range:13:23-13:24",
      ]);
    });
    it("no diagnostic for empty collection - filters", async () => {
      const snippet = `
    <List items="{filters: [], path: 'test-path'}"> </List>`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
    });
    it("no diagnostic for empty collection - sorter", async () => {
      const snippet = `
    <List items="{sorter: [], path: 'test-path'}"> </List>`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
    });
  });
  describe("no diagnostic for any type - value2", () => {
    it("primitive", async () => {
      const snippet = `
        <List
          items="{
              filters: {
                  operator: 'NB',
                  value2: 123
              },
              path: 'test-path'
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
                  operator: 'NB',
                  value2: {}
              },
              path: 'test-path'
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
                  operator: 'NB',
                  value2: []
              },
              path: 'test-path'
            }"
        />`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
    });
  });
  describe("required property", () => {
    it("aggregation - path required", async () => {
      const snippet = `
        <List items="{}"> </List>`;
      const result = await validateView(snippet);
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: MandatoryProperty; text: Mandatory property "path" must be defined; severity:error; range:9:21-9:23',
      ]);
    });
    describe("sorter", () => {
      it("path required", async () => {
        const snippet = `
        <List items="{
          path: 'test-path',
          sorter: {

          }
        }"> </List>`;
        const result = await validateView(snippet);
        expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
          'kind: MandatoryProperty; text: Mandatory property "path" must be defined; severity:error; range:11:18-13:11',
        ]);
      });
      it("path required [collection]", async () => {
        const snippet = `
        <List items="{
          path: 'test-path',
          sorter: [
            {
              
            }
          ]
        }"> </List>`;
        const result = await validateView(snippet);
        expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
          'kind: MandatoryProperty; text: Mandatory property "path" must be defined; severity:error; range:12:12-14:13',
        ]);
      });
    });
  });
  it("tooltip [altTypes]", async () => {
    const snippet = `
       <Text text="My Text" tooltip="{ path: 'descr', formatter: '.getTooltipText'}"/>`;
    const result = await validateView(snippet);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
  it("tooltip [altTypes] - no diagnostics if any element used", async () => {
    const snippet = `
       <Text text="My Text" tooltip="{ parts:['']}"/>`;
    const result = await validateView(snippet);
    expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([]);
  });
});
