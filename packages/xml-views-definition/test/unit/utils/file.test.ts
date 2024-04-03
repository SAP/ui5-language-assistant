import { pathExists, buildFileUri } from "../../../src/utils";
import { join } from "path";

describe("file", () => {
  describe("pathExists", () => {
    test("returns true if path exists", async () => {
      // arrange
      const filePath = join(__dirname, "index.test.ts");
      // act
      const result = await pathExists(filePath);
      // assert
      expect(result).toBe(true);
    });

    test("returns false if path does not exist", async () => {
      // act
      const result = await pathExists("path-does-not-exits");
      // assert
      expect(result).toBe(false);
    });
  });
  describe("buildFileUri", () => {
    const exts = [".controller.js", ".js", ".controller.ts", ".ts"];
    const mockManifestPath = join(__dirname, "..", "data", "manifest.json");

    test("file uri when matching controller file exists with .controller.js extension", async () => {
      // arrange
      const namespace = "sap.ui.demo.walkthrough";
      const value = "sap.ui.demo.walkthrough.controller.App";
      const expectedFileUri = join(
        __dirname,
        "..",
        "data",
        "controller",
        "App.controller.js"
      );
      // act
      const result = await buildFileUri(
        namespace,
        value,
        mockManifestPath,
        exts
      );
      // assert
      expect(result).toBe(expectedFileUri);
    });
    test("file uri when matching controller file exists with .js extension", async () => {
      // arrange
      const namespace = "sap.ui.demo.walkthrough";
      const value = "sap.ui.demo.walkthrough.controller.AppHelper";
      const expectedFileUri = join(
        __dirname,
        "..",
        "data",
        "controller",
        "AppHelper.js"
      );
      // act
      const result = await buildFileUri(
        namespace,
        value,
        mockManifestPath,
        exts
      );
      // assert
      expect(result).toBe(expectedFileUri);
    });

    test("file uri when matching controller file exists with .controller.ts extension", async () => {
      // arrange
      const namespace = "sap.ui.demo.walkthrough";
      const value = "sap.ui.demo.walkthrough.controller.Helper";
      const expectedFileUri = join(
        __dirname,
        "..",
        "data",
        "controller",
        "Helper.controller.ts"
      );
      // act
      const result = await buildFileUri(
        namespace,
        value,
        mockManifestPath,
        exts
      );
      // assert
      expect(result).toBe(expectedFileUri);
    });
    test("file uri when matching controller file exists with .ts extension", async () => {
      // arrange
      const namespace = "sap.ui.demo.walkthrough";
      const value = "sap.ui.demo.walkthrough.controller.Handler";
      const expectedFileUri = join(
        __dirname,
        "..",
        "data",
        "controller",
        "Handler.ts"
      );
      // act
      const result = await buildFileUri(
        namespace,
        value,
        mockManifestPath,
        exts
      );
      // assert
      expect(result).toBe(expectedFileUri);
    });

    test("undefined when no matching controller file exists", async () => {
      // arrange
      const namespace = "sap.ui.demo.walkthrough";
      const value = "sap.ui.demo.walkthrough.controller.Abc";
      // act
      const result = await buildFileUri(
        namespace,
        value,
        mockManifestPath,
        exts
      );
      // assert
      expect(result).toBeUndefined();
    });
  });
});
