import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
  CURSOR_ANCHOR,
} from "@ui5-language-assistant/test-framework";
import { DefinitionParams, Position } from "vscode-languageserver";
import * as fs from "fs";
import * as context from "@ui5-language-assistant/context";
import { getControllerLocation } from "../../../src/controller";
import { join } from "path";
import { URI } from "vscode-uri";

describe("index", () => {
  let testFramework: TestFramework;
  let uri = "";
  const pathSegments = ["src", "view", "App.view.xml"];
  beforeEach(function () {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.tsFreeStyle,
        type: ProjectType.UI5,
        npmInstall: false,
      },
    };
    testFramework = new TestFramework(useConfig);
    uri = testFramework.getFileUri(pathSegments);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe("getControllerLocation", () => {
    test("rootElement undefined - empty location", async () => {
      // arrange
      const param: DefinitionParams = {
        position: {} as Position,
        textDocument: { uri: "file:\\dummy" },
      };
      jest.spyOn(fs.promises, "readFile").mockResolvedValue("");
      // act
      const result = await getControllerLocation(param);
      // assert
      expect(result).toEqual([]);
    });
    test("wrong position - empty location", async () => {
      // arrange
      const param: DefinitionParams = {
        position: { line: 0, character: 0 },
        textDocument: { uri },
      };
      // act
      const result = await getControllerLocation(param);
      // assert
      expect(result).toEqual([]);
    });
    test("getContext error - empty location", async () => {
      // arrange
      const content = `
<mvc:View
	controllerName="sap.demo.ui5typescripttutorialapp.controller${CURSOR_ANCHOR}.App"
	displayBlock="true"
	xmlns="sap.m"
	xmlns:mvc="sap.ui.core.mvc">
</mvc:View>
        `;
      const { offset } = await testFramework.updateFile(pathSegments, content);
      const { textDocumentPosition } = testFramework.toVscodeTextDocument(
        uri,
        content,
        offset
      );
      const position = textDocumentPosition.position;
      const param: DefinitionParams = {
        position,
        textDocument: { uri },
      };
      jest
        .spyOn(context, "getContext")
        .mockResolvedValue(new Error("error-raised"));
      // act
      const result = await getControllerLocation(param);
      // assert
      expect(result).toEqual([]);
    });
    describe("object notation", () => {
      test("wrong position - empty location", async () => {
        // arrange
        const content = `
<core:FragmentDefinition
	core:require="{ MessageToast: 'sap/m/MessageToast', app: ${CURSOR_ANCHOR} 'sap/demo/ui5typescripttutorialapp/controller/App' }"
	xmlns:core="sap.ui.core">
</core:FragmentDefinition>
        `;
        const { offset } = await testFramework.updateFile(
          pathSegments,
          content
        );
        const { textDocumentPosition } = testFramework.toVscodeTextDocument(
          uri,
          content,
          offset
        );

        const param: DefinitionParams = {
          position: textDocumentPosition.position,
          textDocument: { uri },
        };
        // act
        const result = await getControllerLocation(param);
        // assert
        expect(result).toEqual([]);
      });
      test("can not build file uri - empty location", async () => {
        // arrange
        const content = `
<core:FragmentDefinition
	core:require="{ MessageToast: 'sap/m/MessageToast', app: 'sap${CURSOR_ANCHOR}/demo/ui5typescripttutorialapp/controller/App' }"
	xmlns:core="sap.ui.core">
</core:FragmentDefinition>
        `;
        const { offset } = await testFramework.updateFile(
          pathSegments,
          content
        );
        const { textDocumentPosition } = testFramework.toVscodeTextDocument(
          uri,
          content,
          offset
        );

        const param: DefinitionParams = {
          position: textDocumentPosition.position,
          textDocument: { uri },
        };
        // remove file
        await fs.promises.unlink(
          join(
            testFramework.getProjectRoot(),
            "src",
            "controller",
            "App.controller.ts"
          )
        );
        // act
        const result = await getControllerLocation(param);
        // assert
        expect(result).toEqual([]);
      });
      test("correct position", async () => {
        // arrange
        const content = `
<core:FragmentDefinition
	core:require="{ MessageToast: 'sap/m/MessageToast', app: 'sap/demo/ui5typescript${CURSOR_ANCHOR}tutorialapp/controller/App' }"
	xmlns:core="sap.ui.core">
</core:FragmentDefinition>
        `;
        const { offset } = await testFramework.updateFile(
          pathSegments,
          content
        );
        const { textDocumentPosition } = testFramework.toVscodeTextDocument(
          uri,
          content,
          offset
        );
        const position = textDocumentPosition.position;
        const param: DefinitionParams = {
          position,
          textDocument: { uri },
        };
        // act
        const result = await getControllerLocation(param);
        // assert
        expect(result).toEqual([
          {
            uri: URI.file(
              join(
                testFramework.getProjectRoot(),
                "src",
                "controller",
                "App.controller.ts"
              )
            ).toString(),
            range: { start: position, end: position },
          },
        ]);
      });
    });
    describe("dot notation", () => {
      test("wrong position - empty location", async () => {
        // arrange
        const content = `
<mvc:View
	controllerName${CURSOR_ANCHOR}="sap.demo.ui5typescripttutorialapp.controller.App"
	displayBlock="true"
	xmlns="sap.m"
	xmlns:mvc="sap.ui.core.mvc">
</mvc:View>
        `;
        const { offset } = await testFramework.updateFile(
          pathSegments,
          content
        );
        const { textDocumentPosition } = testFramework.toVscodeTextDocument(
          uri,
          content,
          offset
        );

        const param: DefinitionParams = {
          position: textDocumentPosition.position,
          textDocument: { uri },
        };
        // act
        const result = await getControllerLocation(param);
        // assert
        expect(result).toEqual([]);
      });
      test("can not build file uri - empty location", async () => {
        // arrange
        const content = `
<mvc:View
	controllerName="sap.${CURSOR_ANCHOR}demo.ui5typescripttutorialapp.controller.App"
	displayBlock="true"
	xmlns="sap.m"
	xmlns:mvc="sap.ui.core.mvc">
</mvc:View>
        `;
        const { offset } = await testFramework.updateFile(
          pathSegments,
          content
        );
        const { textDocumentPosition } = testFramework.toVscodeTextDocument(
          uri,
          content,
          offset
        );

        const param: DefinitionParams = {
          position: textDocumentPosition.position,
          textDocument: { uri },
        };
        // remove file
        await fs.promises.unlink(
          join(
            testFramework.getProjectRoot(),
            "src",
            "controller",
            "App.controller.ts"
          )
        );
        // act
        const result = await getControllerLocation(param);
        // assert
        expect(result).toEqual([]);
      });
      test("correct position", async () => {
        // arrange
        const content = `
<mvc:View
	controllerName="sap.demo.ui5typescripttutorialapp.controller${CURSOR_ANCHOR}.App"
	displayBlock="true"
	xmlns="sap.m"
	xmlns:mvc="sap.ui.core.mvc">
</mvc:View>
        `;
        const { offset } = await testFramework.updateFile(
          pathSegments,
          content
        );
        const { textDocumentPosition } = testFramework.toVscodeTextDocument(
          uri,
          content,
          offset
        );
        const position = textDocumentPosition.position;
        const param: DefinitionParams = {
          position,
          textDocument: { uri },
        };
        // act
        const result = await getControllerLocation(param);
        // assert
        expect(result).toEqual([
          {
            uri: URI.file(
              join(
                testFramework.getProjectRoot(),
                "src",
                "controller",
                "App.controller.ts"
              )
            ).toString(),
            range: { start: position, end: position },
          },
        ]);
      });
    });
  });
});
