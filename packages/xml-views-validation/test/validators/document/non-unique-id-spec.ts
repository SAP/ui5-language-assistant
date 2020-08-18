import { expect } from "chai";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  validations,
  buildMessage,
} from "@ui5-language-assistant/end-user-strings";
import { validators } from "../../../src/api";
import { NonUniqueIDIssue } from "../../../api";
import {
  computeExpectedRanges,
  testValidationsScenario,
} from "../../test-utils";

const { NON_UNIQUE_ID } = validations;

describe("the use of non unique id validation", () => {
  let ui5SemanticModel: UI5SemanticModel;

  let testNonUniqueIDScenario: (opts: {
    xmlText: string;
    assertion: (issues: NonUniqueIDIssue[]) => void;
  }) => void;

  before(async () => {
    ui5SemanticModel = await generateModel({
      version: "1.74.0",
      modelGenerator: generate,
    });

    testNonUniqueIDScenario = (opts): void =>
      testValidationsScenario({
        model: ui5SemanticModel,
        validators: {
          document: [validators.validateNonUniqueID],
        },
        xmlText: opts.xmlText,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assertion: opts.assertion as any,
      });
  });

  context("true positive scenarios", () => {
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
          expect(issues).to.have.lengthOf(2);

          const expectedRanges = computeExpectedRanges(xmlSnippet);

          expect(issues).to.include.deep.members([
            {
              kind: "NonUniqueIDIssue",
              message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
              severity: "error",
              offsetRange: expectedRanges[0],
              identicalIDsRanges: [expectedRanges[1]],
            },
            {
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
          expect(issues).to.have.lengthOf(2);

          const expectedRanges = computeExpectedRanges(xmlSnippet);

          expect(issues).to.include.deep.members([
            {
              kind: "NonUniqueIDIssue",
              message: buildMessage(NON_UNIQUE_ID.msg, "DUPLICATE"),
              severity: "error",
              offsetRange: expectedRanges[0],
              identicalIDsRanges: [expectedRanges[1]],
            },
            {
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
          expect(issues).to.have.lengthOf(3);

          const expectedRanges = computeExpectedRanges(xmlSnippet);

          expect(issues).to.include.deep.members([
            {
              kind: "NonUniqueIDIssue",
              message: buildMessage(NON_UNIQUE_ID.msg, "TRIPLICATE"),
              severity: "error",
              offsetRange: expectedRanges[0],
              identicalIDsRanges: [expectedRanges[1], expectedRanges[2]],
            },
            {
              kind: "NonUniqueIDIssue",
              message: buildMessage(NON_UNIQUE_ID.msg, "TRIPLICATE"),
              severity: "error",
              offsetRange: expectedRanges[1],
              identicalIDsRanges: [expectedRanges[0], expectedRanges[2]],
            },
            {
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

  context("negative edge cases", () => {
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
          expect(issues).to.be.empty;
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
          expect(issues).to.be.empty;
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
          expect(issues).to.be.empty;
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
          expect(issues).to.be.empty;
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
          expect(issues).to.be.empty;
        },
      });
    });
  });
});
