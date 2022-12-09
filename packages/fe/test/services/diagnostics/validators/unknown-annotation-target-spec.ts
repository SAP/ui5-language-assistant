import { expect } from "chai";
import { join } from "path";
import { Context, getContext } from "@ui5-language-assistant/context";
import { CURSOR_ANCHOR } from "@ui5-language-assistant/test-framework";
import { DocumentCstNode } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

import { AnnotationIssue } from "../../../../src/api";
import { validateXMLView } from "@ui5-language-assistant/xml-views-validation";
import { issueToSnapshot } from "../../utils";
import { validateUnknownAnnotationTarget } from "../../../../src/services/diagnostics/validators/unknown-annotation-target";

let framework: TestFramework;

describe("contextPath attribute value validation", () => {
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

  const validateView = async (
    snippet: string,
    that: { timeout: (t: number) => void },
    contextAdapter?: (context: Context) => Context
  ): Promise<AnnotationIssue[]> => {
    const timeout = 60000;
    that.timeout(timeout);
    let result: AnnotationIssue[] = [];
    try {
      await framework.updateFileContent(viewFilePathSegments, snippet, {
        insertAfter: "<content>",
      });
      const { cst, tokenVector } = await framework.readFile(
        viewFilePathSegments
      );
      const context = await getContext(documentPath);
      const xmlView = buildAst(cst as DocumentCstNode, tokenVector);
      result = validateXMLView({
        validators: {
          attribute: [validateUnknownAnnotationTarget],
          document: [],
          element: [],
        },
        context: contextAdapter ? contextAdapter(context) : context,
        xmlView,
      }) as AnnotationIssue[];
    } finally {
      // reversal update
      await framework.updateFileContent(viewFilePathSegments, "", {
        doUpdatesAfter: "<content>",
        replaceText: snippet.replace(CURSOR_ANCHOR, ""),
      });
    }
    return result;
  };

  context("shows no issues when contextPath is correct", () => {
    it("EntityType", async function () {
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
  });

  context("does not show any warnings when...", () => {
    it("attribute value is absent", async function () {
      const result = await validateView(
        `<macros:Chart contextPath></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("service details are missing in manifest", async function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await validateView(
        `<macros:Chart contextPath=""></macros:Chart>`,
        this,
        (c) => ({ ...c, manifestDetails: undefined } as any)
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

  it("shows info message when contextPath is not recommended to use", async function () {
    const result = await validateView(
      `<macros:Table contextPath="/Travel"></macros:Table>`,
      this
    );
    expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
      "kind: ContextPathBindingNotRecommended; text: contextPath for Table is usually defined if binding for the object is different than that of the page; severity:info; offset:347-355",
    ]);
  });

  context("shows warning when contextPath...", () => {
    it("is empty", async function () {
      const result = await validateView(
        `<macros:Chart contextPath=""></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: AnnotationTargetRequired; text: Annotation target is required; severity:warn; offset:347-348",
      ]);
    });

    it("is relative", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="to_Booking"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: UnknownEnumValue; text: Unknown annotation target: "to_Booking". Absolute path is expected; severity:warn; offset:347-358',
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

    it("has wrong entityType", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel1"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: UnknownEnumValue; text: Unknown target: "/Travel1"; severity:warn; offset:348-355',
      ]);
    });

    it("has wrong entitySet", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/TravelService.EntityContainer/Travel1"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: UnknownEnumValue; text: Unknown target: "/TravelService.EntityContainer/Travel1"; severity:warn; offset:379-385',
      ]);
    });

    it("has wrong navigation property", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel/to_Airport"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: UnknownEnumValue; text: Unknown target: "/Travel/to_Airport"; severity:warn; offset:356-365',
      ]);
    });

    it("has navigation property of wrong cardinality", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel/to_Booking/to_BookSupplement/to_Travel"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: UnknownEnumValue; text: Multiple 1:many association segments not allowed; severity:warn; offset:366-393",
      ]);
    });

    it("is pointing to entity property", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel/TotalPrice"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: UnknownEnumValue; text: Wrong path. It is pointing to entity property but should lead to entity type or entity set; severity:warn; offset:347-366",
      ]);
    });

    it("itself is correct but pointing to invalid (not suitable for context) target", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel/to_Booking"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: InvalidAnnotationTarget; text: Invalid target: "/Travel/to_Booking". Trigger code completion to choose one of valid targets if some are available; severity:warn; offset:347-366',
      ]);
    });
  });
});
