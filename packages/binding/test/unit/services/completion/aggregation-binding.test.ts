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
import { initI18n } from "../../../../src/api";

describe("aggregation binding", () => {
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
    SplitAttributesOnFormat: true,
    LimitUniqueIdDiagnostics: false,
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
    const i18n = await framework.initI18n();
    initI18n(i18n);
    root = framework.getProjectRoot();
    documentPath = join(root, ...viewFilePathSegments);
    const uri = framework.getFileUri(viewFilePathSegments);
    getCompletionResult = getViewCompletionProvider(
      framework,
      viewFilePathSegments,
      documentPath,
      uri,
      settings
    );
  });
  it("all properties", async function () {
    const snippet = `
        <List items="{ ${CURSOR_ANCHOR} }"> </List>`;
    const result = await getCompletionResult(snippet);
    expect(result).toMatchSnapshot();
  });
  describe("sorter", function () {
    it("initial", async function () {
      const snippet = `
        <List items="{sorter: ${CURSOR_ANCHOR} }"> </List>`;
      const result = await getCompletionResult(snippet);
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).toStrictEqual([
        "label: {}; text: {$0}; kind:5; commit:undefined; sort:",
        "label: [{}]; text: [{$0}]; kind:5; commit:undefined; sort:",
      ]);
    });
    it("inside collection", async function () {
      const snippet = `
        <List items="{sorter: [${CURSOR_ANCHOR}] }"> </List>`;
      const result = await getCompletionResult(snippet);
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).toStrictEqual([
        "label: {}; text: {$0}; kind:5; commit:undefined; sort:",
      ]);
    });
    it("all properties", async function () {
      const snippet = `
        <List items="{sorter: {${CURSOR_ANCHOR}} }"> </List>`;
      const result = await getCompletionResult(snippet);
      expect(result).toMatchSnapshot();
    });
    it("all properties - inside collection", async function () {
      const snippet = `
        <List items="{sorter: [{${CURSOR_ANCHOR}}] }"> </List>`;
      const result = await getCompletionResult(snippet);
      expect(result).toMatchSnapshot();
    });
  });
  describe("filters", function () {
    it("initial", async function () {
      const snippet = `
        <List items="{filters: ${CURSOR_ANCHOR} }"> </List>`;
      const result = await getCompletionResult(snippet);
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).toStrictEqual([
        "label: {}; text: {$0}; kind:5; commit:undefined; sort:",
        "label: [{}]; text: [{$0}]; kind:5; commit:undefined; sort:",
      ]);
    });
    it("inside collection", async function () {
      const snippet = `
        <List items="{filters: [${CURSOR_ANCHOR}] }"> </List>`;
      const result = await getCompletionResult(snippet);
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).toStrictEqual([
        "label: {}; text: {$0}; kind:5; commit:undefined; sort:",
      ]);
    });
    it("inside collection - reference", async function () {
      const snippet = `
        <List items="{
          filters: [{
            filters: [${CURSOR_ANCHOR}]
          }]
        }"> </List>`;
      const result = await getCompletionResult(snippet);
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).toStrictEqual([
        "label: {}; text: {$0}; kind:5; commit:undefined; sort:",
      ]);
    });
    it("all properties", async function () {
      const snippet = `
        <List items="{filters: {${CURSOR_ANCHOR}} }"> </List>`;
      const result = await getCompletionResult(snippet);
      expect(result).toMatchSnapshot();
    });
    it("all properties - inside collection", async function () {
      const snippet = `
        <List items="{filters: [{${CURSOR_ANCHOR}}] }"> </List>`;
      const result = await getCompletionResult(snippet);
      expect(result).toMatchSnapshot();
    });
    describe("default value", function () {
      it("operator", async function () {
        const snippet = `
          <List items="{
              filters: {
                  operator: '${CURSOR_ANCHOR}'
              }
          }"> </List>`;
        const result = await getCompletionResult(snippet);
        expect(result).toMatchSnapshot();
      });
    });
    describe("condition", () => {
      it("all properties", async function () {
        const snippet = `
        <List items="{
            filters: {
                condition: {${CURSOR_ANCHOR}}
            }
        }"> </List>`;
        const result = await getCompletionResult(snippet);
        expect(result).toMatchSnapshot();
      });
      it("all properties - nested", async function () {
        const snippet = `
        <List items="{
            filters: {
                condition: {
                    condition: {${CURSOR_ANCHOR}}
                }
            }
        }"> </List>`;
        const result = await getCompletionResult(snippet);
        expect(result).toMatchSnapshot();
      });
    });
    describe("filters", () => {
      it("all properties", async function () {
        const snippet = `
        <List items="{
            filters: {
                filters: [{${CURSOR_ANCHOR}}]
            }
        }"> </List>`;
        const result = await getCompletionResult(snippet);
        expect(result).toMatchSnapshot();
      });
      it("all properties - nested", async function () {
        const snippet = `
            <List items="{
                filters: {
                    filters: [{
                        condition: {
                            filters: [{
                                filters: [{${CURSOR_ANCHOR}}]
                            }]
                        }
                    }]
                }
            }"> </List>`;
        const result = await getCompletionResult(snippet);
        expect(result).toMatchSnapshot();
      });
    });
  });
  it("tooltip [altTypes] - contains both aggregation and property binding info", async () => {
    const snippet = `
       <Text text="My Text" tooltip="{ ${CURSOR_ANCHOR} }"/>`;
    const result = await getCompletionResult(snippet);
    expect(result).toMatchSnapshot();
  });
});
