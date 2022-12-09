import { expect } from "chai";
import { stub } from "sinon";
// import * as chai from 'chai';
// import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot';
// chai.use(jestSnapshotPlugin());
import { join } from "path";
import { Context, getContext } from "@ui5-language-assistant/context";
import { CURSOR_ANCHOR } from "@ui5-language-assistant/test-framework";
import { Settings } from "@ui5-language-assistant/settings";

import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

import { getCompletionItems } from "../../../../src/api";
import { CompletionItem } from "vscode-languageserver";
import { completionItemToSnapshot } from "../../utils";
import {
  FEPropertyMetadata,
  UI5Prop,
} from "@ui5-language-assistant/semantic-model-types";
import * as miscUtils from "../../../../src/utils/misc";

let framework: TestFramework;

describe("contextPath attribute value completion", () => {
  let root: string, uri: string, documentPath: string;

  const viewFilePathSegments = [
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml",
  ];
  const annoFileSegmentsCDS = ["app", "manage_travels", "annotations.cds"];
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

  const annotationSnippetCDS = `
      annotate service.Travel with @(
          UI.Chart #sample1 :{
              ChartType: #Bar
          },
      );
    `;
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
    uri = framework.getFileUri([root, ...viewFilePathSegments]);
    documentPath = join(
      root,
      "app",
      "manage_travels",
      "webapp",
      "ext",
      "main",
      "Main.view.xml"
    );

    await framework.updateFileContent(
      annoFileSegmentsCDS,
      annotationSnippetCDS
    );
  });

  const getCompletionResult = async (
    snippet: string,
    that: { timeout: (t: number) => void },
    contextAdapter?: (context: Context) => Context
  ): Promise<CompletionItem[]> => {
    const timeout = 60000;
    that.timeout(timeout);
    let result: CompletionItem[] = [];
    try {
      const { offset } = await framework.updateFileContent(
        viewFilePathSegments,
        snippet,
        { insertAfter: "<content>" }
      );
      const { ast, cst, tokenVector, content } = await framework.readFile(
        viewFilePathSegments
      );
      const { document, textDocumentPosition } = framework.toVscodeTextDocument(
        uri,
        content,
        offset
      );
      const context = await getContext(documentPath);

      result = getCompletionItems({
        ast,
        context: contextAdapter ? contextAdapter(context) : context,
        cst,
        document,
        documentSettings: settings,
        textDocumentPosition,
        tokenVector,
      });
    } finally {
      // reversal update
      await framework.updateFileContent(viewFilePathSegments, "", {
        doUpdatesAfter: "<content>",
        replaceText: snippet.replace(CURSOR_ANCHOR, ""),
      });
    }
    return result;
  };

  context("contextPath completion", () => {
    const getContextAdapter = (
      metadataAdapter?: (
        m: FEPropertyMetadata | undefined
      ) => FEPropertyMetadata,
      propertyAdapter?: (p: UI5Prop) => UI5Prop
    ) => (c: Context): Context => {
      const pIdx = c.ui5Model.classes[
        "sap.fe.macros.Chart"
      ].properties.findIndex((p) => p.name === "contextPath");
      if (pIdx < 0) {
        return c;
      }
      const property =
        c.ui5Model.classes["sap.fe.macros.Chart"].properties[pIdx];
      const adaptedProperty = propertyAdapter
        ? { ...propertyAdapter(property) }
        : property;
      const meta = adaptedProperty.metadata;
      const adaptedMeta = metadataAdapter ? { ...metadataAdapter(meta) } : meta;
      const adaptedProps = [
        ...c.ui5Model.classes["sap.fe.macros.Chart"].properties,
      ];
      adaptedProps[pIdx] = { ...adaptedProperty, metadata: adaptedMeta };
      return {
        ...c,
        ui5Model: {
          ...c.ui5Model,
          classes: {
            ...c.ui5Model.classes,
            ["sap.fe.macros.Chart"]: {
              ...c.ui5Model.classes["sap.fe.macros.Chart"],
              properties: adaptedProps,
            },
          },
        },
      };
    };

    it("first segment completion", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="${CURSOR_ANCHOR}"></macros:Chart>`,
        this
      );
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).to.deep.equal([
        "label: /TravelService.EntityContainer; text: /TravelService.EntityContainer; kind:19; commit:/; sort:Z",
        "label: /TravelService.EntityContainer/Travel; text: /TravelService.EntityContainer/Travel; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/Booking; text: /TravelService.EntityContainer/Booking; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/BookedFlights; text: /TravelService.EntityContainer/BookedFlights; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/BookingSupplement; text: /TravelService.EntityContainer/BookingSupplement; kind:2; commit:/; sort:B",
        "label: /Travel; text: /Travel; kind:7; commit:; sort:A",
        "label: /Booking; text: /Booking; kind:7; commit:/; sort:A",
        "label: /BookedFlights; text: /BookedFlights; kind:7; commit:/; sort:A",
        "label: /BookingSupplement; text: /BookingSupplement; kind:7; commit:/; sort:A",
      ]);
    });

    it("first segment completion after slash", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="/${CURSOR_ANCHOR}"></macros:Chart>`,
        this
      );
      expect(result.map((item) => item.insertText)).to.deep.equal([
        "TravelService.EntityContainer",
        "TravelService.EntityContainer/Travel",
        "TravelService.EntityContainer/Booking",
        "TravelService.EntityContainer/BookedFlights",
        "TravelService.EntityContainer/BookingSupplement",
        "Travel",
        "Booking",
        "BookedFlights",
        "BookingSupplement",
      ]);
    });

    it("entity set completion after container", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="/TravelService.EntityContainer/${CURSOR_ANCHOR}"></macros:Chart>`,
        this
      );
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).to.deep.equal([
        "label: Travel; text: Travel; kind:2; commit:; sort:B",
        "label: Booking; text: Booking; kind:2; commit:/; sort:B",
        "label: BookedFlights; text: BookedFlights; kind:2; commit:/; sort:B",
        "label: BookingSupplement; text: BookingSupplement; kind:2; commit:/; sort:B",
      ]);
    });

    it("navigation segment completion", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="/TravelService.EntityContainer/Booking/${CURSOR_ANCHOR}"></macros:Chart>`,
        this
      );
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).to.deep.equal([
        "label: to_BookSupplement; text: to_BookSupplement; kind:18; commit:/; sort:N",
        "label: to_Travel; text: to_Travel; kind:18; commit:; sort:N",
      ]);
    });

    it("navigation segment completion (case 2)", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="/Booking/${CURSOR_ANCHOR}"></macros:Chart>`,
        this
      );
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).to.deep.equal([
        "label: to_BookSupplement; text: to_BookSupplement; kind:18; commit:/; sort:N",
        "label: to_Travel; text: to_Travel; kind:18; commit:; sort:N",
      ]);
    });

    it("navigation segment completion leading to entity type the same as entity set type", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="/TravelService.EntityContainer/Travel/to_Booking/${CURSOR_ANCHOR}"></macros:Chart>`,
        this
      );
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).to.deep.equal([
        "label: to_Travel; text: to_Travel; kind:18; commit:; sort:N",
      ]);
    });

    it("navigation segment completion - no cyclic routes", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="/Travel/to_Booking/${CURSOR_ANCHOR}"></macros:Chart>`,
        this
      );
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).to.deep.equal([]);
    });

    context("no completion when...", () => {
      it("UI5Property not found", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="${CURSOR_ANCHOR}"></macros:Chart>`,
          this,
          (c) => {
            const newClasses = { ...c.ui5Model.classes };
            delete newClasses["sap.fe.macros.Chart"];
            const newContext: Context = {
              ...c,
              ui5Model: {
                ...c.ui5Model,
                classes: newClasses,
              },
            };
            return newContext;
          }
        );
        expect(result.length).to.eq(0);
      });

      it("services unavailable", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="${CURSOR_ANCHOR}"></macros:Chart>`,
          this,
          (c) => ({ ...c, services: {} })
        );
        expect(result.length).to.eq(0);
      });

      it("service details are missing in manifest", async function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await getCompletionResult(
          `<macros:Chart contextPath="${CURSOR_ANCHOR}"></macros:Chart>`,
          this,
          (c) => ({ ...c, manifestDetails: undefined } as any)
        );
        expect(result.length).to.eq(0);
      });

      it("service path is not provided in manifest", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="${CURSOR_ANCHOR}"></macros:Chart>`,
          this,
          (c) => ({
            ...c,
            manifestDetails: {
              ...c.manifestDetails,
              mainServicePath: "",
            },
          })
        );
        expect(result.length).to.eq(0);
      });

      it("path is relative", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="to_Booking/${CURSOR_ANCHOR}"></macros:Chart>`,
          this
        );
        expect(result.length).to.eq(0);
      });

      it("empty metadata", async function () {
        const constraintsStub = stub(
          miscUtils,
          "getPathConstraintsForControl"
        ).returns({ expectedAnnotations: [], expectedTypes: [] });
        let result: CompletionItem[];
        try {
          result = await getCompletionResult(
            `<macros:Chart contextPath="${CURSOR_ANCHOR}"></macros:Chart>`,
            this
          );
        } finally {
          constraintsStub.restore();
        }
        expect(result.length).to.eq(0);
      });

      it("no expeted terms in metadata for macros ", async function () {
        const constraintsStub = stub(
          miscUtils,
          "getPathConstraintsForControl"
        ).returns({
          expectedAnnotations: [],
          expectedTypes: ["EntitySet", "EntityType"],
        });
        let result: CompletionItem[];
        try {
          result = await getCompletionResult(
            `<macros:Chart contextPath="${CURSOR_ANCHOR}"></macros:Chart>`,
            this
          );
        } finally {
          constraintsStub.restore();
        }
        expect(result.length).to.eq(0);
      });

      it("existing path target is not resolved", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="/Travel/to_Booking1/${CURSOR_ANCHOR}"></macros:Chart>`,
          this
        );
        expect(result.length).to.eq(0);
      });

      it("existing path target is a property", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="/Travel/BeginDate/${CURSOR_ANCHOR}"></macros:Chart>`,
          this
        );
        expect(result.length).to.eq(0);
      });
    });
  });
});
