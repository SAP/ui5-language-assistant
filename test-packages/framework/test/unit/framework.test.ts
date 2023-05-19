import {
  Config,
  CURSOR_ANCHOR,
  ProjectName,
  ProjectType,
  TestFramework,
} from "../../src/api";
import { join } from "path";
import { Position, Range } from "vscode-languageserver-types";

describe("framework", () => {
  it("getProjectRoot", () => {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: false,
      },
    };
    const testFramework = new TestFramework(useConfig);
    const result = testFramework.getProjectRoot();
    expect(result).toEqual(join(__dirname, "..", "..", "projects-copy", "cap"));
  });
  describe("updateFile", () => {
    let testFramework: TestFramework;
    beforeEach(() => {
      const useConfig: Config = {
        projectInfo: {
          name: ProjectName.cap,
          type: ProjectType.CAP,
          npmInstall: false,
        },
      };
      testFramework = new TestFramework(useConfig);
    });
    it("test file does not exit", async () => {
      await expect(
        testFramework.updateFile(["wrong-path-part", "test"], "<a></a>")
      ).rejects.toThrow();
    });
    it("test write content with position", async () => {
      const position: Position = {
        line: 9,
        character: 17,
      };
      const content = '<Text id="MainPageText" text="⇶"></Text>';
      const filePathParts = [
        "app",
        "manage_travels",
        "webapp",
        "ext",
        "main",
        "Main.view.xml",
      ];
      await testFramework.updateFile(filePathParts, content, position);
      const result = await testFramework.readFile(filePathParts);
      expect(result.content.includes(content.replace(/⇶/, ""))).toBeTrue();
    });
    it("test overwrite content", async () => {
      const content = "<abc></abc>";
      const filePathParts = [
        "app",
        "manage_travels",
        "webapp",
        "ext",
        "main",
        "Main.view.xml",
      ];
      await testFramework.updateFile(filePathParts, content);
      const result = await testFramework.readFile(filePathParts);
      expect(result.content.includes(content)).toBeTrue();
    });
  });
  describe("readFile", () => {
    let testFramework: TestFramework;
    beforeEach(() => {
      const useConfig: Config = {
        projectInfo: {
          name: ProjectName.cap,
          type: ProjectType.CAP,
          npmInstall: false,
        },
      };
      testFramework = new TestFramework(useConfig);
    });
    it("test file does not exit", async () => {
      await expect(
        testFramework.readFile(["wrong-path-part", "test"])
      ).rejects.toThrow();
    });
    it("test read content with range", async () => {
      const range: Range = {
        start: {
          line: 7,
          character: 4,
        },
        end: {
          line: 7,
          character: 34,
        },
      };
      const filePathParts = [
        "app",
        "manage_travels",
        "webapp",
        "ext",
        "main",
        "Main.view.xml",
      ];
      const content = '<Page id="Main" title="Main">';
      const result = await testFramework.readFile(filePathParts, range);
      expect(result.content).toEqual(content);
    });
    it("test read content", async () => {
      const filePathParts = [
        "app",
        "manage_travels",
        "webapp",
        "ext",
        "main",
        "Main.view.xml",
      ];
      const result = await testFramework.readFile(filePathParts);
      expect(result.ast).toContainAllKeys(["position", "rootElement", "type"]);
      expect(result.cst).toContainKeys(["children", "name", "location"]);
      expect(result.tokenVector).not.toBeEmpty();
    });
  });
  it("getFileUri", async () => {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: false,
      },
    };
    const testFramework = new TestFramework(useConfig);
    const result = await testFramework.getFileUri(["a", "test", "file"]);
    expect(result.startsWith("file:")).toBeTrue();
  });
  it("getFileContent", async () => {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: false,
      },
    };
    const filePathParts = [
      "app",
      "manage_travels",
      "webapp",
      "ext",
      "main",
      "Main.view.xml",
    ];
    const testFramework = new TestFramework(useConfig);
    const result = await testFramework.getFileContent(filePathParts);
    const content = ' <Page id="Main" title="Main">';
    expect(result.includes(content)).toBeTrue();
  });
  it("getOffset", async () => {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: false,
      },
    };
    const testFramework = new TestFramework(useConfig);
    const content = ' <Page id="Main" title="⇶">';
    const result = testFramework.getOffset(content);
    expect(result).toEqual(24);
  });
  describe("updateFileContent", () => {
    let testFramework: TestFramework;
    const filePathParts = [
      "app",
      "manage_travels",
      "webapp",
      "ext",
      "main",
      "Main.view.xml",
    ];
    beforeEach(() => {
      const useConfig: Config = {
        projectInfo: {
          name: ProjectName.cap,
          type: ProjectType.CAP,
          npmInstall: false,
        },
      };
      testFramework = new TestFramework(useConfig);
    });
    it("test file does not exit", async () => {
      await expect(
        testFramework.updateFile(["wrong-path-part", "test"], "<a></a>")
      ).rejects.toThrow();
    });
    it("write content at the end of file", async () => {
      const content = '<Text text=""/>';
      await testFramework.updateFile(filePathParts, content);
      const { offset } = await testFramework.updateFileContent(
        filePathParts,
        "<Test />"
      );
      const result = await testFramework.readFile(filePathParts);
      expect(result.content).toEqual('<Text text=""/>\n<Test />');
      expect(offset).toEqual(-1);
    });

    it("test insert before", async () => {
      const content = '<Text text=""/>';
      await testFramework.updateFile(filePathParts, content);
      await testFramework.updateFileContent(filePathParts, "<Test />", {
        insertBefore: "<Text",
      });
      const result = await testFramework.readFile(filePathParts);
      expect(result.content).toEqual('<Test /><Text text=""/>');
    });

    it("test insert after", async () => {
      const content = '<Text text=""/>';
      await testFramework.updateFile(filePathParts, content);
      await testFramework.updateFileContent(filePathParts, 'id="" ', {
        insertAfter: "<Text ",
      });
      const result = await testFramework.readFile(filePathParts);
      expect(result.content).toEqual('<Text id="" text=""/>');
    });

    it("replace and check offset", async () => {
      const content = '<Text text=""/><Field text=""/>';
      await testFramework.updateFile(filePathParts, content);
      const { offset } = await testFramework.updateFileContent(
        filePathParts,
        `id="${CURSOR_ANCHOR}"`,
        { replaceText: 'text=""' }
      );
      const result = await testFramework.readFile(filePathParts);
      expect(result.content).toEqual('<Text id=""/><Field text=""/>');
      expect(offset).toEqual(10);
    });

    it("replace after", async () => {
      const content = '<Text text=""/><Field text=""/>';
      await testFramework.updateFile(filePathParts, content);
      await testFramework.updateFileContent(filePathParts, "id=", {
        replaceText: "text=",
        doUpdatesAfter: "<Field",
      });
      const result = await testFramework.readFile(filePathParts);
      expect(result.content).toEqual('<Text text=""/><Field id=""/>');
    });

    it("leave cursor anchor in file", async () => {
      const content = '<Text text=""/>';
      await testFramework.updateFile(filePathParts, content);
      await testFramework.updateFileContent(
        filePathParts,
        `<Field id="${CURSOR_ANCHOR}" />`,
        {},
        false
      );
      const result = await testFramework.readFile(filePathParts);
      expect(result.content).toEqual(
        `<Text text=""/>\n<Field id="${CURSOR_ANCHOR}" />`
      );
    });

    it("throws exception if lookup fragment not found", async () => {
      const content = '<Text text=""/>';
      await testFramework.updateFile(filePathParts, content);
      try {
        await testFramework.updateFileContent(filePathParts, `<Test />`, {
          doUpdatesAfter: "<>",
        });
        expect(true).toEqual(false); // should not be executed
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });
  it("toVscodeTextDocument", () => {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: false,
      },
    };
    const testFramework = new TestFramework(useConfig);
    const result = testFramework.toVscodeTextDocument(
      "dummy/uri",
      "dummy content",
      1
    );
    expect(result.document.getText()).toEqual("dummy content");
    expect(result.document.languageId).toEqual("");
    expect(result.document.lineCount).toEqual(1);
    expect(result.document.languageId).toEqual("");
    expect(result.document.uri).toEqual("dummy/uri");
    expect(result.document.version).toEqual(1);
    expect(result.textDocumentPosition).toStrictEqual({
      position: { line: 0, character: 1 },
      textDocument: {
        uri: "dummy/uri",
      },
    });
  });
});
