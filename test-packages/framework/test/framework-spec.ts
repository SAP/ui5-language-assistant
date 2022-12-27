import {
  Config,
  CURSOR_ANCHOR,
  ProjectName,
  ProjectType,
  TestFramework,
} from "../src/api";
import { expect } from "chai";
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
    expect(result).to.equal(
      join(__dirname, "..", "..", "projects-copy", "cap")
    );
  });
  context("updateFile", () => {
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
      return testFramework
        .updateFile(["wrong-path-part"], "<a></a>")
        .then(() => {
          // this should never happen
          expect(false).to.be.true;
        })
        .catch((result) => expect(result).to.throws);
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
      expect(result.content.includes(content.replace(/⇶/, ""))).to.be.true;
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
      expect(result.content.includes(content)).to.be.true;
    });
  });
  context("readFile", () => {
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
      return testFramework
        .readFile(["wrong-path-part"])
        .then(() => {
          // this should never happen
          expect(false).to.be.true;
        })
        .catch((result) => expect(result).to.throws);
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
      expect(result.content).to.be.equal(content);
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
      expect(result.ast).to.have.keys("position", "rootElement", "type");
      expect(result.cst).to.have.keys("children", "name", "location");
      expect(result.tokenVector).not.to.be.empty;
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
    expect(result.startsWith("file:")).to.be.true;
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
    expect(result.includes(content)).to.be.true;
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
    expect(result).to.equal(24);
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
      return testFramework
        .updateFile(["wrong-path-part"], "<a></a>")
        .then(() => {
          // this should never happen
          expect(false).to.be.true;
        })
        .catch((result) => expect(result).to.throws);
    });
    it("test write content at the end of file", async () => {
      const content = '<Text text=""/>';
      await testFramework.updateFile(filePathParts, content);
      const { offset } = await testFramework.updateFileContent(
        filePathParts,
        "<Test />"
      );
      const result = await testFramework.readFile(filePathParts);
      expect(result.content).to.eq('<Text text=""/>\n<Test />');
      expect(offset).to.eq(-1);
    });

    it("test insert before", async () => {
      const content = '<Text text=""/>';
      await testFramework.updateFile(filePathParts, content);
      await testFramework.updateFileContent(filePathParts, "<Test />", {
        insertBefore: "<Text",
      });
      const result = await testFramework.readFile(filePathParts);
      expect(result.content).to.eq('<Test /><Text text=""/>');
    });

    it("test insert after", async () => {
      const content = '<Text text=""/>';
      await testFramework.updateFile(filePathParts, content);
      await testFramework.updateFileContent(filePathParts, 'id="" ', {
        insertAfter: "<Text ",
      });
      const result = await testFramework.readFile(filePathParts);
      expect(result.content).to.eq('<Text id="" text=""/>');
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
      expect(result.content).to.eq('<Text id=""/><Field text=""/>');
      expect(offset).to.eq(10);
    });

    it("replace after", async () => {
      const content = '<Text text=""/><Field text=""/>';
      await testFramework.updateFile(filePathParts, content);
      await testFramework.updateFileContent(filePathParts, "id=", {
        replaceText: "text=",
        doUpdatesAfter: "<Field",
      });
      const result = await testFramework.readFile(filePathParts);
      expect(result.content).to.eq('<Text text=""/><Field id=""/>');
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
      expect(result.content).to.eq(
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
        expect(true).to.eq(false); // should not be executed
      } catch (e) {
        expect(e).to.be.thrown;
      }
    });
  });
});
