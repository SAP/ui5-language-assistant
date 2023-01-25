import { expect } from "chai";
import { CompletionItemKind } from "vscode-languageserver-types";

import { UI5XMLViewAnnotationCompletion } from "../../src/types";
import { computeLSPKind } from "../../src/services/completion/utils";
import { fullyQualifiedNameToTerm } from "../../src/utils";

describe("utils spec", () => {
  describe("computeLSPKind assert never", () => {
    const check = (type: string, expectedResult: CompletionItemKind) => {
      const result = computeLSPKind({
        type,
        node: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          kind: "unknown" as any,
        },
      } as UI5XMLViewAnnotationCompletion);
      expect(result).to.eq(expectedResult);
    };

    it("AnnotationTargetInXMLAttributeValue", () => {
      check("AnnotationTargetInXMLAttributeValue", CompletionItemKind.Text);
    });

    it("AnnotationPathInXMLAttributeValue", () => {
      check("AnnotationPathInXMLAttributeValue", CompletionItemKind.Text);
    });

    it("PropertyPathInXMLAttributeValue", () => {
      check("PropertyPathInXMLAttributeValue", CompletionItemKind.Text);
    });

    it("default", () => {
      check("unknown", CompletionItemKind.Text);
    });
  });

  it("wrong term namespace", () => {
    const result = fullyQualifiedNameToTerm(
      "com.sap.vocabularies.UI.v1___.Chart"
    );
    expect(result.alias).to.eq("");
  });
});
