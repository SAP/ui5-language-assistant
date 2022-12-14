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
import { validateMissingViewEntitySet } from "../../../../src/services/diagnostics/validators/missing-entity-set";
import { issueToSnapshot } from "../../utils";

let framework: TestFramework;

describe("missing entitySet validation", () => {
  let root: string, documentPath: string;
  const viewFilePathSegments = [
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml",
  ];

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
          attribute: [validateMissingViewEntitySet],
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

  describe("shows warning when...", () => {
    it("entitySet is absent in manifest", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="@UI.Chart"></macros:Chart>`,
        this,
        (c) => {
          const newContext = {
            ...c,
            manifestDetails: { ...c.manifestDetails, customViews: {} },
          };
          return newContext;
        }
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: MissingEntitySet; text: EntitySet for the current view is missing in application manifest. Attribute value completion and diagnostics are disabled; severity:info; offset:344-354",
      ]);
    });

    it("service details are missing in manifest", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="test"></macros:Chart>`,
        this,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c) => ({ ...c, manifestDetails: undefined } as any)
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: MissingEntitySet; text: EntitySet for the current view is missing in application manifest. Attribute value completion and diagnostics are disabled; severity:info; offset:344-349",
      ]);
    });

    it("custom view id not determined", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="test"></macros:Chart>`,
        this,
        (c) => {
          const newContext: Context = {
            ...c,
            customViewId: "",
          };
          return newContext;
        }
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: MissingEntitySet; text: EntitySet for the current view is missing in application manifest. Attribute value completion and diagnostics are disabled; severity:info; offset:344-349",
      ]);
    });
  });

  describe("does not show warning when...", () => {
    it("entitySet exists in manifest", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("attribute value is absent", async function () {
      const result = await validateView(
        `<macros:Chart metaPath></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("contextPath exists", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel" metaPath="@UI.Chart"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });
  });
});
