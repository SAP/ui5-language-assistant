import { Position } from "vscode-languageserver-textdocument";
import { SourcePosition, XMLElement } from "@xml-tools/ast";
import {
  getAttribute,
  positionContained,
} from "../../../../src/controller/utils";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";

function getXmlElement(text: string): XMLElement {
  const { cst, tokenVector } = parse(text);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  return ast.rootElement as XMLElement;
}

describe("index", () => {
  describe("getAttribute", () => {
    test("no attributes - undefined", () => {
      // arrange
      const element = { attributes: [] } as unknown as XMLElement;
      const position = {} as Position;
      // act
      const result = getAttribute(element, position);
      // assert
      expect(result).toBeUndefined();
    });
    test("for controllerName attribute", () => {
      // arrange
      const text = `
      <mvc:View
          xmlns:core="sap.ui.core"
          controllerName="sap.ui.demo.walkthrough.controller.Main"
      >
      </mvc:View>
      `;
      const element = getXmlElement(text);
      const position: Position = { line: 3, character: 32 };
      // act
      const result = getAttribute(element, position);
      // assert
      expect(result?.value).toEqual("sap.ui.demo.walkthrough.controller.Main");
    });
    test("for template:require attribute", () => {
      // arrange
      const text = `
        <core:FragmentDefinition
            template:require="sap.ui.demo.walkthrough.controller.Helper"
            xmlns:core="sap.ui.core">
        </core:FragmentDefinition>
      `;
      const element = getXmlElement(text);
      const position: Position = { line: 2, character: 32 };
      // act
      const result = getAttribute(element, position);
      // assert
      expect(result?.value).toEqual(
        "sap.ui.demo.walkthrough.controller.Helper"
      );
    });
    test("for core:require attribute", () => {
      // arrange
      const text = `
        <core:FragmentDefinition
            xmlns:core="sap.ui.core"
            xmlns:macros="sap.fe.macros"
        >
            <VBox
                core:require="{ MessageToast: 'sap/m/MessageToast', helper: 'sap/ui/demo/walkthrough/controller/Helper' }"
            />
        </core:FragmentDefinition>
      `;
      const element = getXmlElement(text);
      const position: Position = { line: 6, character: 92 };
      // act
      const result = getAttribute(element, position);
      // assert
      expect(result?.value).toEqual(
        "{ MessageToast: 'sap/m/MessageToast', helper: 'sap/ui/demo/walkthrough/controller/Helper' }"
      );
    });
  });
  describe("positionContained", () => {
    test("true - cursor position is contained in source position", () => {
      // arrange
      const sourcePos: SourcePosition = {
        startLine: 1,
        startColumn: 2,
        endColumn: 4,
        endLine: 2,
        endOffset: 20,
        startOffset: 0,
      };
      const cursorPosition = { line: 0, character: 3 };
      // act
      const result = positionContained(sourcePos, cursorPosition);
      // assert
      expect(result).toBe(true);
    });

    test("false - cursor position is not contained in source position", () => {
      // arrange
      const sourcePos = {
        startLine: 1,
        startColumn: 2,
        endColumn: 4,
        endLine: 2,
        endOffset: 20,
        startOffset: 0,
      } as SourcePosition;
      const cursorPosition = { line: 0, character: 1 };
      // act
      const result = positionContained(sourcePos, cursorPosition);
      // assert
      expect(result).toBe(false);
    });
    test("false - not on same line", () => {
      // arrange
      const sourcePos = {
        startLine: 1,
        startColumn: 2,
        endColumn: 4,
        endLine: 2,
        endOffset: 20,
        startOffset: 0,
      } as SourcePosition;
      const cursorPosition = { line: 5, character: 1 };
      // act
      const result = positionContained(sourcePos, cursorPosition);
      // assert
      expect(result).toBe(false);
    });
  });
});
