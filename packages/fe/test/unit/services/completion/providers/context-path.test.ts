import { join } from "path";
import { Context } from "@ui5-language-assistant/context";
import { CURSOR_ANCHOR } from "@ui5-language-assistant/test-framework";
import { Settings } from "@ui5-language-assistant/settings";

import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

import { CompletionItem } from "vscode-languageserver-types";
import {
  completionItemToSnapshot,
  getViewCompletionProvider,
  ViewCompletionProviderType,
} from "../../utils";
import * as miscUtils from "../../../../../src/utils/misc";

let framework: TestFramework;

describe("contextPath attribute value completion", () => {
  let root: string, uri: string, documentPath: string;
  let getCompletionResult: ViewCompletionProviderType;

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
    SplitAttributesOnFormat: true,
  };

  const annotationSnippetCDS = `
      annotate service.Travel with @(
          UI.Chart #sample1 :{
              ChartType: #Bar
          },
      );
    `;
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
    getCompletionResult = getViewCompletionProvider(
      framework,
      viewFilePathSegments,
      documentPath,
      uri,
      settings
    );
  }, 5 * 60000);

  describe("contextPath completion", () => {
    it("first segment completion", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="${CURSOR_ANCHOR}"></macros:Chart>`
      );
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).toStrictEqual([
        "label: /TravelService.EntityContainer; text: /TravelService.EntityContainer; kind:19; commit:/; sort:Z",
        "label: /TravelService.EntityContainer/Travel; text: /TravelService.EntityContainer/Travel; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/HighestTotal; text: /TravelService.EntityContainer/HighestTotal; kind:2; commit:; sort:B",
        "label: /TravelService.EntityContainer/Currencies; text: /TravelService.EntityContainer/Currencies; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/TravelStatus; text: /TravelService.EntityContainer/TravelStatus; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/TravelAgency; text: /TravelService.EntityContainer/TravelAgency; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/Passenger; text: /TravelService.EntityContainer/Passenger; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/Booking; text: /TravelService.EntityContainer/Booking; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/BookedFlights; text: /TravelService.EntityContainer/BookedFlights; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/Countries; text: /TravelService.EntityContainer/Countries; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/BookingStatus; text: /TravelService.EntityContainer/BookingStatus; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/BookingSupplement; text: /TravelService.EntityContainer/BookingSupplement; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/Airline; text: /TravelService.EntityContainer/Airline; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/Flight; text: /TravelService.EntityContainer/Flight; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/Supplement; text: /TravelService.EntityContainer/Supplement; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/FlightConnection; text: /TravelService.EntityContainer/FlightConnection; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/SupplementType; text: /TravelService.EntityContainer/SupplementType; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/Airport; text: /TravelService.EntityContainer/Airport; kind:2; commit:/; sort:B",
        "label: /TravelService.EntityContainer/Currencies_texts; text: /TravelService.EntityContainer/Currencies_texts; kind:2; commit:; sort:B",
        "label: /TravelService.EntityContainer/TravelStatus_texts; text: /TravelService.EntityContainer/TravelStatus_texts; kind:2; commit:; sort:B",
        "label: /TravelService.EntityContainer/Countries_texts; text: /TravelService.EntityContainer/Countries_texts; kind:2; commit:; sort:B",
        "label: /TravelService.EntityContainer/BookingStatus_texts; text: /TravelService.EntityContainer/BookingStatus_texts; kind:2; commit:; sort:B",
        "label: /TravelService.EntityContainer/Supplement_texts; text: /TravelService.EntityContainer/Supplement_texts; kind:2; commit:; sort:B",
        "label: /TravelService.EntityContainer/SupplementType_texts; text: /TravelService.EntityContainer/SupplementType_texts; kind:2; commit:; sort:B",
        "label: /Travel; text: /Travel; kind:7; commit:/; sort:A",
        "label: /HighestTotal; text: /HighestTotal; kind:7; commit:; sort:A",
        "label: /Currencies; text: /Currencies; kind:7; commit:/; sort:A",
        "label: /TravelStatus; text: /TravelStatus; kind:7; commit:/; sort:A",
        "label: /TravelAgency; text: /TravelAgency; kind:7; commit:/; sort:A",
        "label: /Passenger; text: /Passenger; kind:7; commit:/; sort:A",
        "label: /Booking; text: /Booking; kind:7; commit:/; sort:A",
        "label: /BookedFlights; text: /BookedFlights; kind:7; commit:/; sort:A",
        "label: /Countries; text: /Countries; kind:7; commit:/; sort:A",
        "label: /BookingStatus; text: /BookingStatus; kind:7; commit:/; sort:A",
        "label: /BookingSupplement; text: /BookingSupplement; kind:7; commit:/; sort:A",
        "label: /Airline; text: /Airline; kind:7; commit:/; sort:A",
        "label: /Flight; text: /Flight; kind:7; commit:/; sort:A",
        "label: /Supplement; text: /Supplement; kind:7; commit:/; sort:A",
        "label: /FlightConnection; text: /FlightConnection; kind:7; commit:/; sort:A",
        "label: /SupplementType; text: /SupplementType; kind:7; commit:/; sort:A",
        "label: /Airport; text: /Airport; kind:7; commit:/; sort:A",
        "label: /DraftAdministrativeData; text: /DraftAdministrativeData; kind:7; commit:; sort:A",
        "label: /Currencies_texts; text: /Currencies_texts; kind:7; commit:; sort:A",
        "label: /TravelStatus_texts; text: /TravelStatus_texts; kind:7; commit:; sort:A",
        "label: /Countries_texts; text: /Countries_texts; kind:7; commit:; sort:A",
        "label: /BookingStatus_texts; text: /BookingStatus_texts; kind:7; commit:; sort:A",
        "label: /Supplement_texts; text: /Supplement_texts; kind:7; commit:; sort:A",
        "label: /SupplementType_texts; text: /SupplementType_texts; kind:7; commit:; sort:A",
      ]);
    });

    it("first segment completion after slash", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="/${CURSOR_ANCHOR}"></macros:Chart>`
      );
      expect(result.map((item) => item.insertText)).toStrictEqual([
        "TravelService.EntityContainer",
        "TravelService.EntityContainer/Travel",
        "TravelService.EntityContainer/HighestTotal",
        "TravelService.EntityContainer/Currencies",
        "TravelService.EntityContainer/TravelStatus",
        "TravelService.EntityContainer/TravelAgency",
        "TravelService.EntityContainer/Passenger",
        "TravelService.EntityContainer/Booking",
        "TravelService.EntityContainer/BookedFlights",
        "TravelService.EntityContainer/Countries",
        "TravelService.EntityContainer/BookingStatus",
        "TravelService.EntityContainer/BookingSupplement",
        "TravelService.EntityContainer/Airline",
        "TravelService.EntityContainer/Flight",
        "TravelService.EntityContainer/Supplement",
        "TravelService.EntityContainer/FlightConnection",
        "TravelService.EntityContainer/SupplementType",
        "TravelService.EntityContainer/Airport",
        "TravelService.EntityContainer/Currencies_texts",
        "TravelService.EntityContainer/TravelStatus_texts",
        "TravelService.EntityContainer/Countries_texts",
        "TravelService.EntityContainer/BookingStatus_texts",
        "TravelService.EntityContainer/Supplement_texts",
        "TravelService.EntityContainer/SupplementType_texts",
        "Travel",
        "HighestTotal",
        "Currencies",
        "TravelStatus",
        "TravelAgency",
        "Passenger",
        "Booking",
        "BookedFlights",
        "Countries",
        "BookingStatus",
        "BookingSupplement",
        "Airline",
        "Flight",
        "Supplement",
        "FlightConnection",
        "SupplementType",
        "Airport",
        "DraftAdministrativeData",
        "Currencies_texts",
        "TravelStatus_texts",
        "Countries_texts",
        "BookingStatus_texts",
        "Supplement_texts",
        "SupplementType_texts",
      ]);
    });

    it("entity set completion after container", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="/TravelService.EntityContainer/${CURSOR_ANCHOR}"></macros:Chart>`
      );
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).toStrictEqual([
        "label: Travel; text: Travel; kind:2; commit:/; sort:B",
        "label: Currencies; text: Currencies; kind:2; commit:/; sort:B",
        "label: TravelStatus; text: TravelStatus; kind:2; commit:/; sort:B",
        "label: TravelAgency; text: TravelAgency; kind:2; commit:/; sort:B",
        "label: Passenger; text: Passenger; kind:2; commit:/; sort:B",
        "label: Booking; text: Booking; kind:2; commit:/; sort:B",
        "label: BookedFlights; text: BookedFlights; kind:2; commit:/; sort:B",
        "label: Countries; text: Countries; kind:2; commit:/; sort:B",
        "label: BookingStatus; text: BookingStatus; kind:2; commit:/; sort:B",
        "label: BookingSupplement; text: BookingSupplement; kind:2; commit:/; sort:B",
        "label: Airline; text: Airline; kind:2; commit:/; sort:B",
        "label: Flight; text: Flight; kind:2; commit:/; sort:B",
        "label: Supplement; text: Supplement; kind:2; commit:/; sort:B",
        "label: FlightConnection; text: FlightConnection; kind:2; commit:/; sort:B",
        "label: SupplementType; text: SupplementType; kind:2; commit:/; sort:B",
        "label: Airport; text: Airport; kind:2; commit:/; sort:B",
      ]);
    });

    it("navigation segment completion", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="/TravelService.EntityContainer/Booking/${CURSOR_ANCHOR}"></macros:Chart>`
      );
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).toStrictEqual([
        "label: CurrencyCode; text: CurrencyCode; kind:18; commit:/; sort:N",
        "label: BookingStatus; text: BookingStatus; kind:18; commit:/; sort:N",
        "label: to_BookSupplement; text: to_BookSupplement; kind:18; commit:/; sort:N",
        "label: to_Carrier; text: to_Carrier; kind:18; commit:/; sort:N",
        "label: to_Customer; text: to_Customer; kind:18; commit:/; sort:N",
        "label: to_Travel; text: to_Travel; kind:18; commit:/; sort:N",
        "label: to_Flight; text: to_Flight; kind:18; commit:/; sort:N",
        "label: DraftAdministrativeData; text: DraftAdministrativeData; kind:18; commit:; sort:N",
      ]);
    });
    it("navigation segment completion (case 2)", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="/Booking/${CURSOR_ANCHOR}"></macros:Chart>`
      );
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).toStrictEqual([
        "label: CurrencyCode; text: CurrencyCode; kind:18; commit:/; sort:N",
        "label: BookingStatus; text: BookingStatus; kind:18; commit:/; sort:N",
        "label: to_BookSupplement; text: to_BookSupplement; kind:18; commit:/; sort:N",
        "label: to_Carrier; text: to_Carrier; kind:18; commit:/; sort:N",
        "label: to_Customer; text: to_Customer; kind:18; commit:/; sort:N",
        "label: to_Travel; text: to_Travel; kind:18; commit:/; sort:N",
        "label: to_Flight; text: to_Flight; kind:18; commit:/; sort:N",
        "label: DraftAdministrativeData; text: DraftAdministrativeData; kind:18; commit:; sort:N",
      ]);
    });

    it("navigation segment completion leading to entity type the same as entity set type", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="/TravelService.EntityContainer/Travel/to_Booking/${CURSOR_ANCHOR}"></macros:Chart>`
      );
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).toStrictEqual([
        "label: CurrencyCode; text: CurrencyCode; kind:18; commit:/; sort:N",
        "label: BookingStatus; text: BookingStatus; kind:18; commit:/; sort:N",
        "label: to_Carrier; text: to_Carrier; kind:18; commit:/; sort:N",
        "label: to_Customer; text: to_Customer; kind:18; commit:/; sort:N",
        "label: to_Travel; text: to_Travel; kind:18; commit:/; sort:N",
        "label: to_Flight; text: to_Flight; kind:18; commit:/; sort:N",
        "label: DraftAdministrativeData; text: DraftAdministrativeData; kind:18; commit:; sort:N",
      ]);
    });

    it("navigation segment completion - no cyclic routes", async function () {
      const result = await getCompletionResult(
        `<macros:Chart contextPath="/Travel/to_Booking/${CURSOR_ANCHOR}"></macros:Chart>`
      );
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).toStrictEqual([
        "label: CurrencyCode; text: CurrencyCode; kind:18; commit:/; sort:N",
        "label: BookingStatus; text: BookingStatus; kind:18; commit:/; sort:N",
        "label: to_Carrier; text: to_Carrier; kind:18; commit:/; sort:N",
        "label: to_Customer; text: to_Customer; kind:18; commit:/; sort:N",
        "label: to_Flight; text: to_Flight; kind:18; commit:/; sort:N",
        "label: DraftAdministrativeData; text: DraftAdministrativeData; kind:18; commit:; sort:N",
      ]);
    });

    describe("when contextPath spec contains expected terms", () => {
      let constraintsStub: jest.SpyInstance;
      beforeAll(() => {
        constraintsStub = jest
          .spyOn(miscUtils, "getPathConstraintsForControl")
          .mockReturnValue({
            expectedAnnotations: [
              {
                alias: "UI",
                fullyQualifiedName: "com.sap.vocabularies.UI.v1.Chart",
                name: "Chart",
              },
            ],
            expectedTypes: ["EntitySet", "EntityType"],
          });
      });
      afterAll(() => {
        constraintsStub.mockRestore();
      });

      it("first segment completion", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="${CURSOR_ANCHOR}"></macros:Chart>`
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).toStrictEqual([
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
          `<macros:Chart contextPath="/${CURSOR_ANCHOR}"></macros:Chart>`
        );
        expect(result.map((item) => item.insertText)).toStrictEqual([
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
          `<macros:Chart contextPath="/TravelService.EntityContainer/${CURSOR_ANCHOR}"></macros:Chart>`
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).toStrictEqual([
          "label: Travel; text: Travel; kind:2; commit:; sort:B",
          "label: Booking; text: Booking; kind:2; commit:/; sort:B",
          "label: BookedFlights; text: BookedFlights; kind:2; commit:/; sort:B",
          "label: BookingSupplement; text: BookingSupplement; kind:2; commit:/; sort:B",
        ]);
      });

      it("navigation segment completion", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="/TravelService.EntityContainer/Booking/${CURSOR_ANCHOR}"></macros:Chart>`
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).toStrictEqual([
          "label: to_BookSupplement; text: to_BookSupplement; kind:18; commit:/; sort:N",
          "label: to_Travel; text: to_Travel; kind:18; commit:; sort:N",
        ]);
      });

      it("navigation segment completion (case 2)", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="/Booking/${CURSOR_ANCHOR}"></macros:Chart>`
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).toStrictEqual([
          "label: to_BookSupplement; text: to_BookSupplement; kind:18; commit:/; sort:N",
          "label: to_Travel; text: to_Travel; kind:18; commit:; sort:N",
        ]);
      });

      it("navigation segment completion leading to entity type the same as entity set type", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="/TravelService.EntityContainer/Travel/to_Booking/${CURSOR_ANCHOR}"></macros:Chart>`
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).toStrictEqual([
          "label: to_Travel; text: to_Travel; kind:18; commit:; sort:N",
        ]);
      });

      it("navigation segment completion - no cyclic routes", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="/Travel/to_Booking/${CURSOR_ANCHOR}"></macros:Chart>`
        );
        expect(
          result.map((item) => completionItemToSnapshot(item))
        ).toStrictEqual([]);
      });
    });

    describe("no completion when...", () => {
      it("UI5Property not found", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="${CURSOR_ANCHOR}"></macros:Chart>`,
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
        expect(result.length).toEqual(0);
      });

      it("services unavailable", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="${CURSOR_ANCHOR}"></macros:Chart>`,
          (c) => ({ ...c, services: {} })
        );
        expect(result.length).toEqual(0);
      });

      it("service path is not provided in manifest", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="${CURSOR_ANCHOR}"></macros:Chart>`,

          (c) => ({
            ...c,
            manifestDetails: {
              ...c.manifestDetails,
              mainServicePath: "",
            },
          })
        );
        expect(result.length).toEqual(0);
      });

      it("path is relative", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="to_Booking/${CURSOR_ANCHOR}"></macros:Chart>`
        );
        expect(result.length).toEqual(0);
      });

      it("empty metadata", async function () {
        const constraintsStub = jest
          .spyOn(miscUtils, "getPathConstraintsForControl")
          .mockReturnValue({ expectedAnnotations: [], expectedTypes: [] });
        let result: CompletionItem[];
        try {
          result = await getCompletionResult(
            `<macros:Chart contextPath="${CURSOR_ANCHOR}"></macros:Chart>`
          );
        } finally {
          constraintsStub.mockRestore();
        }
        expect(result.length).toEqual(0);
      });

      it("existing path target is not resolved", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="/Travel/to_Booking1/${CURSOR_ANCHOR}"></macros:Chart>`
        );
        expect(result.length).toEqual(0);
      });

      it("existing path target is a property", async function () {
        const result = await getCompletionResult(
          `<macros:Chart contextPath="/Travel/BeginDate/${CURSOR_ANCHOR}"></macros:Chart>`
        );
        expect(result.length).toEqual(0);
      });
    });
  });
});
