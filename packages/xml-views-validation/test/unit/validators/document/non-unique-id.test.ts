import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { DEFAULT_UI5_VERSION } from "@ui5-language-assistant/constant";
import {
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  validations,
  buildMessage,
} from "@ui5-language-assistant/user-facing-text";
import { validators } from "../../../../src/api";
import { NonUniqueIDIssue } from "../../../../api";
import {
  computeExpectedRanges,
  getDefaultContext,
  testValidationsScenario,
} from "../../test-utils";
import { Context as AppContext } from "@ui5-language-assistant/context";

const { NON_UNIQUE_ID } = validations;

describe("the use of non unique id validation", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  let testNonUniqueIDScenario: (opts: {
    xmlText: string;
    assertion: (issues: NonUniqueIDIssue[]) => void;
  }) => void;

  beforeAll(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: (
        await getFallbackPatchVersions()
      ).SAPUI5 as typeof DEFAULT_UI5_VERSION,
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
    testNonUniqueIDScenario = (opts): void =>
      testValidationsScenario({
        context: appContext,
        validators: {
          document: [validators.validateNonUniqueID],
        },
        xmlText: opts.xmlText,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assertion: opts.assertion as any,
      });
  });

  describe("true positive scenarios", () => {
    it("will detect two duplicate ID in different controls", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons"
            id=🢂"DUPLICATE"🢀
            >
            <Button id=🢂"DUPLICATE"🢀>
            </Button>
          </mvc:View>`;

      testNonUniqueIDScenario({
        xmlText: xmlSnippet,
        assertion: (issues) => {
          expect(issues).toHaveLength(2);

          const expectedRanges = computeExpectedRanges(xmlSnippet);

          expect(issues).toIncludeAllMembers([
            {
              issueType: "base",
              kind: "NonUniqueIDIssue",
              message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
              severity: "error",
              offsetRange: expectedRanges[0],
              identicalIDsRanges: [expectedRanges[1]],
            },
            {
              issueType: "base",
              kind: "NonUniqueIDIssue",
              message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
              severity: "error",
              offsetRange: expectedRanges[1],
              identicalIDsRanges: [expectedRanges[0]],
            },
          ]);
        },
      });
    });

    it("will detect two duplicate ID in different custom controls", () => {
      const xmlSnippet = `
          <custom:View
            xmlns:custom="foo.bar"
            xmlns="bar.foo"
            id=🢂"DUPLICATE"🢀
            >
            <Button id=🢂"DUPLICATE"🢀>
            </Button>
          </custom:View>`;

      testNonUniqueIDScenario({
        xmlText: xmlSnippet,
        assertion: (issues) => {
          expect(issues).toHaveLength(2);

          const expectedRanges = computeExpectedRanges(xmlSnippet);

          expect(issues).toIncludeAllMembers([
            {
              issueType: "base",
              kind: "NonUniqueIDIssue",
              message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
              severity: "error",
              offsetRange: expectedRanges[0],
              identicalIDsRanges: [expectedRanges[1]],
            },
            {
              issueType: "base",
              kind: "NonUniqueIDIssue",
              message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
              severity: "error",
              offsetRange: expectedRanges[1],
              identicalIDsRanges: [expectedRanges[0]],
            },
          ]);
        },
      });
    });

    it("will detect three duplicate ID in different controls", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons"
            id=🢂"TRIPLICATE"🢀
            >
            <Button id=🢂"TRIPLICATE"🢀>
            </Button>
            <Button id=🢂"TRIPLICATE"🢀>
            </Button>
          </mvc:View>`;

      testNonUniqueIDScenario({
        xmlText: xmlSnippet,
        assertion: (issues) => {
          expect(issues).toHaveLength(3);

          const expectedRanges = computeExpectedRanges(xmlSnippet);

          expect(issues).toIncludeAllMembers([
            {
              issueType: "base",
              kind: "NonUniqueIDIssue",
              message: buildMessage(NON_UNIQUE_ID.msg, "TRIPLICATE"),
              severity: "error",
              offsetRange: expectedRanges[0],
              identicalIDsRanges: [expectedRanges[1], expectedRanges[2]],
            },
            {
              issueType: "base",
              kind: "NonUniqueIDIssue",
              message: buildMessage(NON_UNIQUE_ID.msg, "TRIPLICATE"),
              severity: "error",
              offsetRange: expectedRanges[1],
              identicalIDsRanges: [expectedRanges[0], expectedRanges[2]],
            },
            {
              issueType: "base",
              kind: "NonUniqueIDIssue",
              message: buildMessage(NON_UNIQUE_ID.msg, "TRIPLICATE"),
              severity: "error",
              offsetRange: expectedRanges[2],
              identicalIDsRanges: [expectedRanges[0], expectedRanges[1]],
            },
          ]);
        },
      });
    });
  });

  describe("negative edge cases", () => {
    it("will not detect issues for duplicate attribute keys that are not `id`", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons"
            iddqd="DUPLICATE"
            >
            <Button iddqd="DUPLICATE">
            </Button>
          </mvc:View>`;

      testNonUniqueIDScenario({
        xmlText: xmlSnippet,
        assertion: (issues) => {
          expect(issues).toBeEmpty;
        },
      });
    });

    it("will not detect issues for attributes that do not have a value", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons"
            id="DUPLICATE"
            >
            <Button id=>
            </Button>
          </mvc:View>`;

      testNonUniqueIDScenario({
        xmlText: xmlSnippet,
        assertion: (issues) => {
          expect(issues).toBeEmpty;
        },
      });
    });

    it("will not detect issues for attributes that have an empty value", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons"
            id=""
            >
            <Button id="">
            </Button>
          </mvc:View>`;

      testNonUniqueIDScenario({
        xmlText: xmlSnippet,
        assertion: (issues) => {
          expect(issues).toBeEmpty;
        },
      });
    });

    it("will not detect issues for id attributes under lowercase element tags", () => {
      const xmlSnippet = `
          <mvc:view
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.ui.commons"
            id="DUPLICATE"
            >
            <Button id="DUPLICATE">
            </Button>
          </mvc:view>`;

      testNonUniqueIDScenario({
        xmlText: xmlSnippet,
        assertion: (issues) => {
          expect(issues).toBeEmpty;
        },
      });
    });

    it("will not detect issues for id attributes under whitelisted (none UI5) namespaces", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:svg="http://www.w3.org/2000/svg"
            xmlns="sap.ui.commons"
            id="DUPLICATE"
            >
            <svg:Circle id="DUPLICATE">
            </svg:Circle>
          </mvc:View>`;

      testNonUniqueIDScenario({
        xmlText: xmlSnippet,
        assertion: (issues) => {
          expect(issues).toBeEmpty;
        },
      });
    });
  });
});
