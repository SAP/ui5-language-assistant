import { expect } from "chai";
import { stub } from "sinon"; // import * as chai from 'chai';
// import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot';
// chai.use(jestSnapshotPlugin());
import { join } from "path";
import { cache, Context, getContext } from "@ui5-language-assistant/context";
import { CURSOR_ANCHOR } from "@ui5-language-assistant/test-framework";
import { Settings } from "@ui5-language-assistant/settings";

import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { CompletionItem } from "vscode-languageserver";

import { getCompletionItems } from "../../../../src/api";
import { completionItemToSnapshot } from "../../utils";

import * as miscUtils from "../../../../src/utils/misc";

let framework: TestFramework;

describe("metaPath attribute value completion", () => {
  let root: string, uri: string, documentPath: string;

  const viewFilePathSegments = [
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml",
  ];
  const annoFileSegmentsXML = [
    "app",
    "manage_travels",
    "webapp",
    "annotations",
    "annotation.xml",
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
          UI.Chart :{
            ChartType: #Bar
          },
          UI.Chart #sample1 :{
              ChartType: #Bar
          },
      );
    `;

  const annotationSnippetXML = `
      <Annotations Target="TravelService.Travel">
          <Annotation Term="UI.Chart" >
              <Record Type="UI.ChartDefinitionType">
                  <PropertyValue Property="ChartType" EnumMember="UI.ChartType/Area"/>
              </Record>
          </Annotation>
      </Annotations>
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

  context("no completion when...", () => {
    it("UI5Property not found", async function () {
      cache.reset();
      const result = await getCompletionResult(
        `<macros:Chart metaPath="${CURSOR_ANCHOR}"></macros:Chart>`,
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
        `<macros:Chart metaPath="${CURSOR_ANCHOR}"></macros:Chart>`,
        this,
        (c) => ({ ...c, services: {} })
      );
      expect(result.length).to.eq(0);
    });

    it("contextPath is not absolute", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="to_Booking" metaPath="${CURSOR_ANCHOR}"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("path is absolute - not supported", async function () {
      const result = await getCompletionResult(
        `<macros:Chart metaPath="/${CURSOR_ANCHOR}"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("existing navigation segments not allowed", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="/Travel" metaPath="to_Booking/${CURSOR_ANCHOR}"></macros:Chart>`,
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
          `<macros:Chart metaPath="${CURSOR_ANCHOR}"></macros:Chart>`,
          this
        );
      } finally {
        constraintsStub.restore();
      }
      expect(result.length).to.eq(0);
    });

    it("existing path target is not resolved", async function () {
      const result = await getCompletionResult(
        `<macros:Chart metaPath="to_Booking1/${CURSOR_ANCHOR}"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("existing path target is a property", async function () {
      const result = await getCompletionResult(
        `<macros:Chart metaPath="BeginDate/${CURSOR_ANCHOR}"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("existing path target is a property (case 2)", async function () {
      const result = await getCompletionResult(
        `<macros:Field metaPath="BeginDate/${CURSOR_ANCHOR}"></macros:Field>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("contextPath is targeting a property", async function () {
      const result = await getCompletionResult(
        `<macros:Field contextPath="/Travel/BeginDate" metaPath="${CURSOR_ANCHOR}"></macros:Field>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("contextPath is targeting entity container", async function () {
      const result = await getCompletionResult(
        `<macros:Field contextPath="/TravelService.EntityContainer" metaPath="${CURSOR_ANCHOR}"></macros:Field>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("service details are missing in manifest", async function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await getCompletionResult(
        `<macros:Chart metaPath="${CURSOR_ANCHOR}"></macros:Chart>`,
        this,
        (c) => ({ ...c, manifestDetails: undefined } as any)
      );
      expect(result.length).to.eq(0);
    });

    it("service path is not provided in manifest", async function () {
      const result = await getCompletionResult(
        `<macros:Chart metaPath="${CURSOR_ANCHOR}"></macros:Chart>`,
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

    it("custom views are missing in manifest", async function () {
      const result = await getCompletionResult(
        `<macros:Chart metaPath="${CURSOR_ANCHOR}"></macros:Chart>`,
        this,
        (c) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newDetails: any = { ...c.manifestDetails };
          delete newDetails["customViews"];
          const newContext = {
            ...c,
            manifestDetails: newDetails,
          };
          return newContext;
        }
      );
      expect(result.length).to.eq(0);
    });

    it("custom views are empty manifest", async function () {
      const result = await getCompletionResult(
        `<macros:Chart metaPath="${CURSOR_ANCHOR}"></macros:Chart>`,
        this,
        (c) => {
          const newContext = {
            ...c,
            manifestDetails: { ...c.manifestDetails, customViews: {} },
          };
          return newContext;
        }
      );
      expect(result.length).to.eq(0);
    });

    it("custom view id not determined", async function () {
      const result = await getCompletionResult(
        `<macros:Chart metaPath="${CURSOR_ANCHOR}"></macros:Chart>`,
        this,
        (c) => {
          const newContext: Context = {
            ...c,
            customViewId: "",
          };
          return newContext;
        }
      );
      expect(result.length).to.eq(0);
    });
  });

  context("Annotation path", () => {
    context("metaPath completion", () => {
      it("first segment completion", async function () {
        const result = await getCompletionResult(
          `<macros:Chart metaPath="${CURSOR_ANCHOR}"></macros:Chart>`,
          this
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: @com.sap.vocabularies.UI.v1.Chart; text: @com.sap.vocabularies.UI.v1.Chart; kind:12; commit:undefined; sort:",
          "label: @com.sap.vocabularies.UI.v1.Chart#sample1; text: @com.sap.vocabularies.UI.v1.Chart#sample1; kind:12; commit:undefined; sort:",
          "label: to_Booking; text: to_Booking; kind:18; commit:/; sort:B",
          "label: to_BookedFlights; text: to_BookedFlights; kind:18; commit:/; sort:B",
        ]);
      });
      it("second segment completion", async function () {
        const result = await getCompletionResult(
          `<macros:Chart metaPath="to_Booking/${CURSOR_ANCHOR}"></macros:Chart>`,
          this
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: to_Travel; text: to_Travel; kind:18; commit:/; sort:B",
        ]);
      });
      it("third segment completion", async function () {
        const result = await getCompletionResult(
          `<macros:Chart metaPath="to_Booking/to_Travel/${CURSOR_ANCHOR}"></macros:Chart>`,
          this
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: @com.sap.vocabularies.UI.v1.Chart; text: @com.sap.vocabularies.UI.v1.Chart; kind:12; commit:undefined; sort:",
          "label: @com.sap.vocabularies.UI.v1.Chart#sample1; text: @com.sap.vocabularies.UI.v1.Chart#sample1; kind:12; commit:undefined; sort:",
        ]);
      });
    });

    context("metaPath completion with contextPath provided", () => {
      it("term segment completion from entity type", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="/Travel" metaPath="${CURSOR_ANCHOR}"></macros:Chart>`,
          this
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: @com.sap.vocabularies.UI.v1.Chart; text: @com.sap.vocabularies.UI.v1.Chart; kind:12; commit:undefined; sort:",
          "label: @com.sap.vocabularies.UI.v1.Chart#sample1; text: @com.sap.vocabularies.UI.v1.Chart#sample1; kind:12; commit:undefined; sort:",
        ]);
      });
      it("term segment completion from entity set", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="/TravelService.EntityContainer/Travel" metaPath="${CURSOR_ANCHOR}"></macros:Chart>`,
          this
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: @com.sap.vocabularies.UI.v1.Chart; text: @com.sap.vocabularies.UI.v1.Chart; kind:12; commit:undefined; sort:",
          "label: @com.sap.vocabularies.UI.v1.Chart#sample1; text: @com.sap.vocabularies.UI.v1.Chart#sample1; kind:12; commit:undefined; sort:",
        ]);
      });
    });
  });

  context("Property path", () => {
    context("metaPath completion", () => {
      it("first segment completion", async function () {
        const result = await getCompletionResult(
          `<macros:Field id="field1" metaPath="${CURSOR_ANCHOR}"></macros:Field>`,
          this
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: CurrencyCode; text: CurrencyCode; kind:18; commit:/; sort:B",
          "label: TravelStatus; text: TravelStatus; kind:18; commit:/; sort:B",
          "label: to_Agency; text: to_Agency; kind:18; commit:/; sort:B",
          "label: to_Customer; text: to_Customer; kind:18; commit:/; sort:B",
          "label: to_Booking; text: to_Booking; kind:18; commit:/; sort:B",
          "label: to_BookedFlights; text: to_BookedFlights; kind:18; commit:/; sort:B",
          "label: DraftAdministrativeData; text: DraftAdministrativeData; kind:18; commit:/; sort:B",
          "label: createdAt; text: createdAt; kind:10; commit:undefined; sort:A",
          "label: createdBy; text: createdBy; kind:10; commit:undefined; sort:A",
          "label: LastChangedAt; text: LastChangedAt; kind:10; commit:undefined; sort:A",
          "label: LastChangedBy; text: LastChangedBy; kind:10; commit:undefined; sort:A",
          "label: TravelUUID; text: TravelUUID; kind:10; commit:undefined; sort:A",
          "label: TravelID; text: TravelID; kind:10; commit:undefined; sort:A",
          "label: BeginDate; text: BeginDate; kind:10; commit:undefined; sort:A",
          "label: EndDate; text: EndDate; kind:10; commit:undefined; sort:A",
          "label: BookingFee; text: BookingFee; kind:10; commit:undefined; sort:A",
          "label: TotalPrice; text: TotalPrice; kind:10; commit:undefined; sort:A",
          "label: CurrencyCode_code; text: CurrencyCode_code; kind:10; commit:undefined; sort:A",
          "label: Description; text: Description; kind:10; commit:undefined; sort:A",
          "label: TravelStatus_code; text: TravelStatus_code; kind:10; commit:undefined; sort:A",
          "label: GoGreen; text: GoGreen; kind:10; commit:undefined; sort:A",
          "label: GreenFee; text: GreenFee; kind:10; commit:undefined; sort:A",
          "label: TreesPlanted; text: TreesPlanted; kind:10; commit:undefined; sort:A",
          "label: to_Agency_AgencyID; text: to_Agency_AgencyID; kind:10; commit:undefined; sort:A",
          "label: to_Customer_CustomerID; text: to_Customer_CustomerID; kind:10; commit:undefined; sort:A",
          "label: acceptEnabled; text: acceptEnabled; kind:10; commit:undefined; sort:A",
          "label: rejectEnabled; text: rejectEnabled; kind:10; commit:undefined; sort:A",
          "label: deductDiscountEnabled; text: deductDiscountEnabled; kind:10; commit:undefined; sort:A",
          "label: IsActiveEntity; text: IsActiveEntity; kind:10; commit:undefined; sort:A",
          "label: HasActiveEntity; text: HasActiveEntity; kind:10; commit:undefined; sort:A",
          "label: HasDraftEntity; text: HasDraftEntity; kind:10; commit:undefined; sort:A",
        ]);
      });
      it("second segment completion", async function () {
        const result = await getCompletionResult(
          `<macros:Field id="field1" metaPath="to_Booking/${CURSOR_ANCHOR}"></macros:Field>`,
          this
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: CurrencyCode; text: CurrencyCode; kind:18; commit:/; sort:B",
          "label: BookingStatus; text: BookingStatus; kind:18; commit:/; sort:B",
          "label: to_Carrier; text: to_Carrier; kind:18; commit:/; sort:B",
          "label: to_Customer; text: to_Customer; kind:18; commit:/; sort:B",
          "label: to_Travel; text: to_Travel; kind:18; commit:/; sort:B",
          "label: to_Flight; text: to_Flight; kind:18; commit:/; sort:B",
          "label: DraftAdministrativeData; text: DraftAdministrativeData; kind:18; commit:/; sort:B",
          "label: createdAt; text: createdAt; kind:10; commit:undefined; sort:A",
          "label: createdBy; text: createdBy; kind:10; commit:undefined; sort:A",
          "label: LastChangedAt; text: LastChangedAt; kind:10; commit:undefined; sort:A",
          "label: LastChangedBy; text: LastChangedBy; kind:10; commit:undefined; sort:A",
          "label: BookingUUID; text: BookingUUID; kind:10; commit:undefined; sort:A",
          "label: BookingID; text: BookingID; kind:10; commit:undefined; sort:A",
          "label: BookingDate; text: BookingDate; kind:10; commit:undefined; sort:A",
          "label: ConnectionID; text: ConnectionID; kind:10; commit:undefined; sort:A",
          "label: FlightDate; text: FlightDate; kind:10; commit:undefined; sort:A",
          "label: FlightPrice; text: FlightPrice; kind:10; commit:undefined; sort:A",
          "label: CurrencyCode_code; text: CurrencyCode_code; kind:10; commit:undefined; sort:A",
          "label: BookingStatus_code; text: BookingStatus_code; kind:10; commit:undefined; sort:A",
          "label: to_Carrier_AirlineID; text: to_Carrier_AirlineID; kind:10; commit:undefined; sort:A",
          "label: to_Customer_CustomerID; text: to_Customer_CustomerID; kind:10; commit:undefined; sort:A",
          "label: to_Travel_TravelUUID; text: to_Travel_TravelUUID; kind:10; commit:undefined; sort:A",
          "label: criticality; text: criticality; kind:10; commit:undefined; sort:A",
          "label: BookedFlights; text: BookedFlights; kind:10; commit:undefined; sort:A",
          "label: EligibleForPrime; text: EligibleForPrime; kind:10; commit:undefined; sort:A",
          "label: IsActiveEntity; text: IsActiveEntity; kind:10; commit:undefined; sort:A",
          "label: HasActiveEntity; text: HasActiveEntity; kind:10; commit:undefined; sort:A",
          "label: HasDraftEntity; text: HasDraftEntity; kind:10; commit:undefined; sort:A",
        ]);
      });
      it("third segment completion", async function () {
        const result = await getCompletionResult(
          `<macros:Field id="field1" metaPath="to_Booking/to_Travel/${CURSOR_ANCHOR}"></macros:Field>`,
          this
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: CurrencyCode; text: CurrencyCode; kind:18; commit:/; sort:B",
          "label: TravelStatus; text: TravelStatus; kind:18; commit:/; sort:B",
          "label: to_Agency; text: to_Agency; kind:18; commit:/; sort:B",
          "label: to_Customer; text: to_Customer; kind:18; commit:/; sort:B",
          "label: DraftAdministrativeData; text: DraftAdministrativeData; kind:18; commit:/; sort:B",
          "label: createdAt; text: createdAt; kind:10; commit:undefined; sort:A",
          "label: createdBy; text: createdBy; kind:10; commit:undefined; sort:A",
          "label: LastChangedAt; text: LastChangedAt; kind:10; commit:undefined; sort:A",
          "label: LastChangedBy; text: LastChangedBy; kind:10; commit:undefined; sort:A",
          "label: TravelUUID; text: TravelUUID; kind:10; commit:undefined; sort:A",
          "label: TravelID; text: TravelID; kind:10; commit:undefined; sort:A",
          "label: BeginDate; text: BeginDate; kind:10; commit:undefined; sort:A",
          "label: EndDate; text: EndDate; kind:10; commit:undefined; sort:A",
          "label: BookingFee; text: BookingFee; kind:10; commit:undefined; sort:A",
          "label: TotalPrice; text: TotalPrice; kind:10; commit:undefined; sort:A",
          "label: CurrencyCode_code; text: CurrencyCode_code; kind:10; commit:undefined; sort:A",
          "label: Description; text: Description; kind:10; commit:undefined; sort:A",
          "label: TravelStatus_code; text: TravelStatus_code; kind:10; commit:undefined; sort:A",
          "label: GoGreen; text: GoGreen; kind:10; commit:undefined; sort:A",
          "label: GreenFee; text: GreenFee; kind:10; commit:undefined; sort:A",
          "label: TreesPlanted; text: TreesPlanted; kind:10; commit:undefined; sort:A",
          "label: to_Agency_AgencyID; text: to_Agency_AgencyID; kind:10; commit:undefined; sort:A",
          "label: to_Customer_CustomerID; text: to_Customer_CustomerID; kind:10; commit:undefined; sort:A",
          "label: acceptEnabled; text: acceptEnabled; kind:10; commit:undefined; sort:A",
          "label: rejectEnabled; text: rejectEnabled; kind:10; commit:undefined; sort:A",
          "label: deductDiscountEnabled; text: deductDiscountEnabled; kind:10; commit:undefined; sort:A",
          "label: IsActiveEntity; text: IsActiveEntity; kind:10; commit:undefined; sort:A",
          "label: HasActiveEntity; text: HasActiveEntity; kind:10; commit:undefined; sort:A",
          "label: HasDraftEntity; text: HasDraftEntity; kind:10; commit:undefined; sort:A",
        ]);
      });
    });

    context("metaPath completion with contextPath provided", () => {
      it("property segment completion from entity type", async function () {
        const result = await getCompletionResult(
          `<macros:Field id="field1" contextPath="/Travel" metaPath="${CURSOR_ANCHOR}"></macros:Field>`,
          this
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: createdAt; text: createdAt; kind:10; commit:undefined; sort:A",
          "label: createdBy; text: createdBy; kind:10; commit:undefined; sort:A",
          "label: LastChangedAt; text: LastChangedAt; kind:10; commit:undefined; sort:A",
          "label: LastChangedBy; text: LastChangedBy; kind:10; commit:undefined; sort:A",
          "label: TravelUUID; text: TravelUUID; kind:10; commit:undefined; sort:A",
          "label: TravelID; text: TravelID; kind:10; commit:undefined; sort:A",
          "label: BeginDate; text: BeginDate; kind:10; commit:undefined; sort:A",
          "label: EndDate; text: EndDate; kind:10; commit:undefined; sort:A",
          "label: BookingFee; text: BookingFee; kind:10; commit:undefined; sort:A",
          "label: TotalPrice; text: TotalPrice; kind:10; commit:undefined; sort:A",
          "label: CurrencyCode_code; text: CurrencyCode_code; kind:10; commit:undefined; sort:A",
          "label: Description; text: Description; kind:10; commit:undefined; sort:A",
          "label: TravelStatus_code; text: TravelStatus_code; kind:10; commit:undefined; sort:A",
          "label: GoGreen; text: GoGreen; kind:10; commit:undefined; sort:A",
          "label: GreenFee; text: GreenFee; kind:10; commit:undefined; sort:A",
          "label: TreesPlanted; text: TreesPlanted; kind:10; commit:undefined; sort:A",
          "label: to_Agency_AgencyID; text: to_Agency_AgencyID; kind:10; commit:undefined; sort:A",
          "label: to_Customer_CustomerID; text: to_Customer_CustomerID; kind:10; commit:undefined; sort:A",
          "label: acceptEnabled; text: acceptEnabled; kind:10; commit:undefined; sort:A",
          "label: rejectEnabled; text: rejectEnabled; kind:10; commit:undefined; sort:A",
          "label: deductDiscountEnabled; text: deductDiscountEnabled; kind:10; commit:undefined; sort:A",
          "label: IsActiveEntity; text: IsActiveEntity; kind:10; commit:undefined; sort:A",
          "label: HasActiveEntity; text: HasActiveEntity; kind:10; commit:undefined; sort:A",
          "label: HasDraftEntity; text: HasDraftEntity; kind:10; commit:undefined; sort:A",
        ]);
      });
      it("property segment completion from entity set", async function () {
        const result = await getCompletionResult(
          `<macros:Field id="field1" contextPath="/TravelService.EntityContainer/Travel" metaPath="${CURSOR_ANCHOR}"></macros:Field>`,
          this
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).to.deep.equal([
          "label: createdAt; text: createdAt; kind:10; commit:undefined; sort:A",
          "label: createdBy; text: createdBy; kind:10; commit:undefined; sort:A",
          "label: LastChangedAt; text: LastChangedAt; kind:10; commit:undefined; sort:A",
          "label: LastChangedBy; text: LastChangedBy; kind:10; commit:undefined; sort:A",
          "label: TravelUUID; text: TravelUUID; kind:10; commit:undefined; sort:A",
          "label: TravelID; text: TravelID; kind:10; commit:undefined; sort:A",
          "label: BeginDate; text: BeginDate; kind:10; commit:undefined; sort:A",
          "label: EndDate; text: EndDate; kind:10; commit:undefined; sort:A",
          "label: BookingFee; text: BookingFee; kind:10; commit:undefined; sort:A",
          "label: TotalPrice; text: TotalPrice; kind:10; commit:undefined; sort:A",
          "label: CurrencyCode_code; text: CurrencyCode_code; kind:10; commit:undefined; sort:A",
          "label: Description; text: Description; kind:10; commit:undefined; sort:A",
          "label: TravelStatus_code; text: TravelStatus_code; kind:10; commit:undefined; sort:A",
          "label: GoGreen; text: GoGreen; kind:10; commit:undefined; sort:A",
          "label: GreenFee; text: GreenFee; kind:10; commit:undefined; sort:A",
          "label: TreesPlanted; text: TreesPlanted; kind:10; commit:undefined; sort:A",
          "label: to_Agency_AgencyID; text: to_Agency_AgencyID; kind:10; commit:undefined; sort:A",
          "label: to_Customer_CustomerID; text: to_Customer_CustomerID; kind:10; commit:undefined; sort:A",
          "label: acceptEnabled; text: acceptEnabled; kind:10; commit:undefined; sort:A",
          "label: rejectEnabled; text: rejectEnabled; kind:10; commit:undefined; sort:A",
          "label: deductDiscountEnabled; text: deductDiscountEnabled; kind:10; commit:undefined; sort:A",
          "label: IsActiveEntity; text: IsActiveEntity; kind:10; commit:undefined; sort:A",
          "label: HasActiveEntity; text: HasActiveEntity; kind:10; commit:undefined; sort:A",
          "label: HasDraftEntity; text: HasDraftEntity; kind:10; commit:undefined; sort:A",
        ]);
      });
    });
  });
});
