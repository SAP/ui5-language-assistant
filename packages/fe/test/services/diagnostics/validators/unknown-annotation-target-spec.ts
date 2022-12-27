import { expect } from "chai";
import { join } from "path";
import { stub } from "sinon";
import { cache } from "@ui5-language-assistant/context";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

import {
  getViewValidator,
  issueToSnapshot,
  ViewValidatorType,
} from "../../utils";
import { validateUnknownAnnotationTarget } from "../../../../src/services/diagnostics/validators/unknown-annotation-target";
import * as miscUtils from "../../../../src/utils/misc";

let framework: TestFramework;

describe("contextPath attribute value validation", () => {
  let root: string, documentPath: string;
  let validateView: ViewValidatorType;

  const viewFilePathSegments = [
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml",
  ];
  const annoFileSegmentsCDS = ["app", "manage_travels", "annotations.cds"];

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

    validateView = getViewValidator(
      framework,
      viewFilePathSegments,
      documentPath,
      validateUnknownAnnotationTarget
    );
  });

  context("shows no issues when contextPath is correct", () => {
    it("EntityType", async function () {
      cache.reset();
      const result = await validateView(
        `<macros:Chart contextPath="/Travel"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("EntitySet", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/TravelService.EntityContainer/Travel"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("Navigation segments (case 1)", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/TravelService.EntityContainer/Travel/to_Booking/to_Travel"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("Navigation segments (case 2)", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Booking/to_Travel"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("Has trailing slash", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Booking/to_Travel/"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });
  });

  context("does not show any warnings when...", () => {
    it("attribute value is absent", async function () {
      const result = await validateView(
        `<macros:Chart contextPath></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("service path is not provided in manifest", async function () {
      const result = await validateView(
        `<macros:Chart contextPath=""></macros:Chart>`,
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
  });

  context(
    "shows info message when contextPath is not recommended to use",
    () => {
      it("annotation target", async function () {
        const result = await validateView(
          `<macros:Form contextPath="/Travel"></macros:Form>`,
          this
        );
        expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
          "kind: ContextPathBindingNotRecommended; text: Context path for Form is usually defined if binding for the object is different than that of the page; severity:info; offset:346-354",
          "kind: InvalidAnnotationTarget; text: Invalid contextPath value. It does not lead to any annotations of the expected type; severity:warn; offset:346-354",
        ]);
      });

      it("property path target", async function () {
        const result = await validateView(
          `<macros:Field contextPath="/Booking"></macros:Field>`,
          this
        );
        expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
          "kind: ContextPathBindingNotRecommended; text: Context path for Field is usually defined if binding for the object is different than that of the page; severity:info; offset:347-356",
        ]);
      });
    }
  );

  context("shows warning when contextPath...", () => {
    it("is empty", async function () {
      const result = await validateView(
        `<macros:Chart contextPath=""></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: AnnotationTargetRequired; text: contextPath value cannot be empty. Enter value or remove contextPath property; severity:warn; offset:347-348",
      ]);
    });

    it("is relative", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="to_Booking"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: UnknownEnumValue; text: Invalid contextPath value: "to_Booking". Absolute path is expected; severity:warn; offset:347-358',
      ]);
    });

    it("is incomplete", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/TravelService.EntityContainer"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: IncompletePath; text: Path is incomplete. Trigger code completion to choose next available path segment; severity:warn; offset:347-378",
      ]);
    });

    it("is incomplete (with not recommended contextPath)", async function () {
      const result = await validateView(
        `<macros:Table contextPath="/TravelService.EntityContainer"></macros:Table>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: ContextPathBindingNotRecommended; text: Context path for Table is usually defined if binding for the object is different than that of the page; severity:info; offset:347-378",
        "kind: IncompletePath; text: Path is incomplete. It leads to entity container; severity:warn; offset:347-378",
      ]);
    });

    it("has wrong entityType", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel1"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: UnknownEnumValue; text: Unknown context path: "/Travel1"; severity:warn; offset:348-355',
      ]);
    });

    it("has wrong entitySet", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/TravelService.EntityContainer/Travel1"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: UnknownEnumValue; text: Unknown context path: "/TravelService.EntityContainer/Travel1"; severity:warn; offset:379-385',
      ]);
    });

    it("has wrong navigation property", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel/to_Airport"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: UnknownEnumValue; text: Unknown context path: "/Travel/to_Airport"; severity:warn; offset:356-365',
      ]);
    });

    it("has navigation property of wrong cardinality", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel/to_Booking/to_BookSupplement/to_Travel"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: UnknownEnumValue; text: Invalid contextPath value. Multiple 1:many association segments not allowed; severity:warn; offset:366-393",
      ]);
    });

    it("has empty segments", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel//"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: UnknownEnumValue; text: Unknown context path: "/Travel//"; severity:warn; offset:356-356',
      ]);
    });

    it("is pointing to entity property", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel/TotalPrice"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: UnknownEnumValue; text: Invalid contextPath value. It leads to entity property, but expected types are: Edm.EntitySet, Edm.EntityType, Edm.Singleton, Edm.NavigationProperty; severity:warn; offset:347-366",
      ]);
    });

    it("no annotation applied on the target", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Booking"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: InvalidAnnotationTarget; text: Invalid contextPath value. It does not lead to any annotations of the expected type; severity:warn; offset:347-356",
      ]);
    });

    it("no annotation applied on the target (with not recommended contextPath)", async function () {
      const result = await validateView(
        `<macros:Table contextPath="/Booking"></macros:Table>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: ContextPathBindingNotRecommended; text: Context path for Table is usually defined if binding for the object is different than that of the page; severity:info; offset:347-356",
        "kind: InvalidAnnotationTarget; text: Invalid contextPath value. It does not lead to any annotations of the expected type; severity:warn; offset:347-356",
      ]);
    });

    it("is of type which is not expected", async function () {
      const st = stub(miscUtils, "getPathConstraintsForControl").returns({
        expectedAnnotations: [],
        expectedTypes: ["EntitySet", "Singleton"],
      });
      try {
        const result = await validateView(
          `<macros:Chart contextPath="/Travel"></macros:Chart>`,
          this
        );
        expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
          "kind: InvalidAnnotationTarget; text: Invalid contextPath value. The path leads to Edm.EntityType, but expected types are: Edm.EntitySet, Edm.Singleton; severity:warn; offset:347-355",
        ]);
      } finally {
        st.restore();
      }
    });

    it("is of type which is not expected (with not recommended contextPath)", async function () {
      const st = stub(miscUtils, "getPathConstraintsForControl")
        .onFirstCall()
        .returns({ expectedAnnotations: [], expectedTypes: [] })
        .onSecondCall()
        .returns({
          expectedAnnotations: [],
          expectedTypes: ["EntitySet", "Singleton"],
        });

      try {
        const result = await validateView(
          `<macros:Table contextPath="/Travel"></macros:Table>`,
          this
        );
        expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
          "kind: ContextPathBindingNotRecommended; text: Context path for Table is usually defined if binding for the object is different than that of the page; severity:info; offset:347-355",
          "kind: InvalidAnnotationTarget; text: Invalid contextPath value. The path leads to Edm.EntityType, but expected types are: Edm.EntitySet, Edm.Singleton; severity:warn; offset:347-355",
        ]);
      } finally {
        st.restore();
      }
    });

    context("when contextPath spec contains expected terms", () => {
      let constraintsStub;
      before(() => {
        constraintsStub = stub(
          miscUtils,
          "getPathConstraintsForControl"
        ).returns({
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
      after(() => {
        constraintsStub.restore();
      });
      it("itself is correct but pointing to invalid (not suitable for context) target", async function () {
        const result = await validateView(
          `<macros:Chart contextPath="/Travel/to_Booking"></macros:Chart>`,
          this
        );
        expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
          "kind: InvalidAnnotationTarget; text: Invalid contextPath value. Trigger code completion to choose one of valid targets if some are available; severity:warn; offset:347-366",
        ]);
      });

      it("correct path", async function () {
        const result = await validateView(
          `<macros:Chart contextPath="/Travel"></macros:Chart>`,
          this
        );
        expect(result.length).to.eq(0);
      });
    });
  });
});
