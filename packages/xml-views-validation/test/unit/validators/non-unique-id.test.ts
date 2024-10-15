import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { Context, getContext, cache } from "@ui5-language-assistant/context";
import {
  setConfigurationSettings,
  getDefaultSettings,
} from "@ui5-language-assistant/settings";
import { join } from "path";
import { validateNonUniqueID } from "../../../src/validators";
import {
  validations,
  buildMessage,
} from "@ui5-language-assistant/user-facing-text";
import { XMLAttribute, XMLDocument, XMLElement } from "@xml-tools/ast";
import {
  locationToRange,
  OffsetRange,
} from "@ui5-language-assistant/logic-utils";
import { Range } from "vscode-languageserver-types";
import { URI } from "vscode-uri";

const { NON_UNIQUE_ID } = validations;
let testFramework: TestFramework;
const viewFilePathSegments = [
  "app",
  "manage_travels",
  "webapp",
  "ext",
  "main",
  "Main.view.xml",
];

const getDocumentPath = () =>
  join(testFramework.getProjectRoot(), ...viewFilePathSegments);
const getOffsetRange = (
  attributes: XMLAttribute[],
  key: string
): OffsetRange | undefined => {
  const id = attributes.find((i) => i.key === key);
  if (id) {
    const offsetRange = {
      start: id.syntax.value?.startOffset ?? 0,
      end: id.syntax.value?.endOffset ?? 0,
    };
    return offsetRange;
  }
  return;
};

function processOffsetRanges(
  elements: XMLElement[],
  offSetRanges: OffsetRange[],
  key = "id"
) {
  for (const el of elements) {
    const offsetRange = getOffsetRange(el.attributes, key);
    if (offsetRange) {
      offSetRanges.push(offsetRange);
    }
    if (el.subElements.length) {
      processOffsetRanges(el.subElements, offSetRanges, key);
    }
  }
}

const getOffsetRanges = (
  context: Context,
  key = "id"
): Record<string, OffsetRange[]> => {
  const viewFiles = Object.keys(context.viewFiles);
  const offsetRangesPerView = {};
  for (const view of viewFiles) {
    const xmlDoc = context.viewFiles[view];
    if (xmlDoc.rootElement) {
      const offsetRanges: OffsetRange[] = [];
      const offsetRange = getOffsetRange(xmlDoc.rootElement?.attributes, key);
      if (offsetRange) {
        offsetRanges.push(offsetRange);
      }
      processOffsetRanges(xmlDoc.rootElement.subElements, offsetRanges, key);
      offsetRangesPerView[view] = offsetRanges;
    }
  }
  return offsetRangesPerView;
};

function getIdRanges(elements: XMLElement[], ranges: Range[] = []): Range[] {
  for (const el of elements) {
    const id = el.attributes.find((i) => i.key === "id");
    if (id) {
      ranges.push(locationToRange(id.syntax.value));
    }
    if (el.subElements.length) {
      getIdRanges(el.subElements, ranges);
    }
  }
  return ranges;
}

async function getParam(xmlSnippet: string): Promise<{
  context: Context;
  xmlView: XMLDocument;
  offsetRanges: Record<string, OffsetRange[]>;
  documentPath: string;
}> {
  await testFramework.updateFile(viewFilePathSegments, xmlSnippet);
  const documentPath = getDocumentPath();
  const context = (await getContext(documentPath)) as Context;
  const xmlView = context.viewFiles[context.documentPath];
  const offsetRanges = getOffsetRanges(context);
  return { context, xmlView, offsetRanges, documentPath };
}
describe("the use of non unique id validation", () => {
  beforeEach(function () {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: false,
      },
    };
    testFramework = new TestFramework(useConfig);
    // reset cache to avoid side effect
    cache.reset();
    setConfigurationSettings(getDefaultSettings());
  });
  describe("true positive scenarios", () => {
    it("will detect two duplicate ID in different controls", async () => {
      // arrange
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons"
            id="DUPLICATE"
            >
            <Button id="DUPLICATE">
            </Button>
          </mvc:View>`;
      const { context, offsetRanges, documentPath } = await getParam(
        xmlSnippet
      );
      const offset = offsetRanges[documentPath];
      // act
      const result = validateNonUniqueID(context);
      // assert
      expect(result).toEqual([
        {
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
          severity: "error",
          offsetRange: offset[0],
          identicalIDsRanges: [],
        },
        {
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
          severity: "error",
          offsetRange: offset[1],
          identicalIDsRanges: [],
        },
      ]);
    });

    it("will detect two duplicate ID in different custom controls", async () => {
      // arrange
      const xmlSnippet = `
          <custom:View
            xmlns:custom="foo.bar"
            xmlns="bar.foo"
            id="DUPLICATE"
            >
            <Button id="DUPLICATE">
            </Button>
          </custom:View>`;

      const { context, offsetRanges, documentPath } = await getParam(
        xmlSnippet
      );
      const offset = offsetRanges[documentPath];
      // act
      const result = validateNonUniqueID(context);
      // assert
      expect(result).toEqual([
        {
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
          severity: "error",
          offsetRange: offset[0],
          identicalIDsRanges: [],
        },
        {
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
          severity: "error",
          offsetRange: offset[1],
          identicalIDsRanges: [],
        },
      ]);
    });
    it("will detect three duplicate ID in different controls", async () => {
      // arrange
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons"
            id="TRIPLICATE"
            >
            <Button id="TRIPLICATE">
            </Button>
            <Button id="TRIPLICATE">
            </Button>
          </mvc:View>`;
      const { context, offsetRanges, documentPath } = await getParam(
        xmlSnippet
      );
      const offset = offsetRanges[documentPath];
      // act
      const result = validateNonUniqueID(context);
      // assert
      expect(result).toEqual([
        {
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, "TRIPLICATE"),
          severity: "error",
          offsetRange: offset[0],
          identicalIDsRanges: [],
        },
        {
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, "TRIPLICATE"),
          severity: "error",
          offsetRange: offset[1],
          identicalIDsRanges: [],
        },
        {
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, "TRIPLICATE"),
          severity: "error",
          offsetRange: offset[2],
          identicalIDsRanges: [],
        },
      ]);
    });

    it("will detect duplicate IDs cross view files", async () => {
      // arrange
      const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.commons"
          >
          <Button id="DUPLICATE">
          </Button>
          <Button id="DUPLICATE">
          </Button>
        </mvc:View>`;
      // modify context
      const xmlSnippet02 = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.commons"
          >
          <Button id="DUPLICATE">
          </Button>
          <Button id="DUPLICATE">
          </Button>
        </mvc:View>`;

      const CustomSectionSegments = [
        "app",
        "manage_travels",
        "webapp",
        "ext",
        "fragment",
        "CustomSection.fragment.xml",
      ];
      await testFramework.updateFile(CustomSectionSegments, xmlSnippet02);
      const customSectionPath = join(
        testFramework.getProjectRoot(),
        ...CustomSectionSegments
      );

      const { context, offsetRanges, documentPath } = await getParam(
        xmlSnippet
      );
      const offset = offsetRanges[documentPath];
      const ranges = getIdRanges(
        context.viewFiles[customSectionPath].rootElement?.subElements ?? []
      );
      const customSectionUri = URI.file(customSectionPath).toString();
      const identicalIDsRanges = ranges.map((range) => ({
        uri: customSectionUri,
        range,
      }));
      // act
      const result = validateNonUniqueID(context);
      // assert
      expect(result).toEqual([
        {
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
          severity: "error",
          offsetRange: offset[0],
          identicalIDsRanges,
        },
        {
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
          severity: "error",
          offsetRange: offset[1],
          identicalIDsRanges,
        },
      ]);
    });
    it("will not detect duplicate IDs cross view files when UI5LanguageAssistant.LimitUniqueIdDiagnostics settings set to false", async () => {
      // arrange
      setConfigurationSettings({
        ...getDefaultSettings(),
        LimitUniqueIdDiagnostics: true,
      });
      const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.commons"
          >
          <Button id="DUPLICATE">
          </Button>
          <Button id="DUPLICATE">
          </Button>
        </mvc:View>`;
      // modify context
      const xmlSnippet02 = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.ui.commons"
          >
          <Button id="DUPLICATE">
          </Button>
          <Button id="DUPLICATE">
          </Button>
        </mvc:View>`;

      const CustomSectionSegments = [
        "app",
        "manage_travels",
        "webapp",
        "ext",
        "fragment",
        "CustomSection.fragment.xml",
      ];
      await testFramework.updateFile(CustomSectionSegments, xmlSnippet02);
      const { context, offsetRanges, documentPath } = await getParam(
        xmlSnippet
      );
      const offset = offsetRanges[documentPath];
      // act
      const result = validateNonUniqueID(context);
      // assert
      expect(result).toEqual([
        {
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
          severity: "error",
          offsetRange: offset[0],
          identicalIDsRanges: [], // empty identical id ranges => no cross view files
        },
        {
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
          severity: "error",
          offsetRange: offset[1],
          identicalIDsRanges: [], // empty identical id ranges => no cross view files
        },
      ]);
    });
  });
  describe("negative edge cases", () => {
    it("will not detect issues for duplicate attribute keys that are not `id`", async () => {
      // arrange
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons"
            iddqd="DUPLICATE"
            >
            <Button iddqd="DUPLICATE">
            </Button>
          </mvc:View>`;
      const { context } = await getParam(xmlSnippet);
      // act
      const result = validateNonUniqueID(context);
      // assert
      expect(result).toBeEmpty();
    });
    it("will not detect issues for attributes that have an empty value", async () => {
      // arrange
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons"
            id=""
            >
            <Button id="">
            </Button>
          </mvc:View>`;
      const { context } = await getParam(xmlSnippet);
      // act
      const result = validateNonUniqueID(context);
      // assert
      expect(result).toBeEmpty();
    });
    it("will not detect issues for id attributes under lowercase element tags", async () => {
      // arrange
      const xmlSnippet = `
          <mvc:view
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons"
            id="DUPLICATE"
            >
            <Button id="DUPLICATE">
            </Button>
          </mvc:view>`;
      const { context } = await getParam(xmlSnippet);
      // act
      const result = validateNonUniqueID(context);
      // assert
      expect(result).toBeEmpty();
    });
    it("will not detect issues for id attributes under allow list (none UI5) namespaces", async () => {
      // arrange
      const xmlSnippet = `
          <mvc:View
            xmlns:svg="http://www.w3.org/2000/svg"
            xmlns="sap.ui.commons"
            id="DUPLICATE"
            >
            <svg:Circle id="DUPLICATE">
            </svg:Circle>
          </mvc:View>`;
      const { context } = await getParam(xmlSnippet);
      // act
      const result = validateNonUniqueID(context);
      // assert
      expect(result).toBeEmpty();
    });
  });
});
