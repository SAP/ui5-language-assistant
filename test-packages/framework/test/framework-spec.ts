import { Config, ProjectName, ProjectType, TestFramework } from "../src/api";
import { expect } from "chai";
import { join } from "path";
import { Position, Range } from "vscode-languageserver-types";

describe("framework", () => {
  it("getProjectRoot", () => {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.cap,
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
          type: ProjectType.cap,
          npmInstall: false,
        },
      };
      testFramework = new TestFramework(useConfig);
    });
    it("test file does not exit", async () => {
      const root = testFramework.getProjectRoot();
      const filePath = join(root, "wrong-path-part");

      return testFramework
        .updateFile(["wrong-path-part"], "<a></a>")
        .then(() => {
          // this should never happen
          expect(false).to.be.true;
        })
        .catch((result) =>
          expect(result).to.equal(`File ${filePath} is not existing`)
        );
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
          type: ProjectType.cap,
          npmInstall: false,
        },
      };
      testFramework = new TestFramework(useConfig);
    });
    it("test file does not exit", async () => {
      const root = testFramework.getProjectRoot();
      const filePath = join(root, "wrong-path-part");

      return testFramework
        .readFile(["wrong-path-part"])
        .then(() => {
          // this should never happen
          expect(false).to.be.true;
        })
        .catch((result) =>
          expect(result).to.equal(`File ${filePath} is not existing`)
        );
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
      expect(result.offset).to.equal(0);
      expect(result.ast).to.have.keys("position", "rootElement", "type");
      expect(result.cst).to.have.keys("children", "name", "location");
      expect(result.tokenVector).not.to.be.empty;
    });
  });
  it("getProjectData", async () => {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.cap,
        npmInstall: false,
      },
    };
    const testFramework = new TestFramework(useConfig);
    const result = await testFramework.getProjectData();
    expect(result).to.have.keys(
      "appRoot",
      "projectInfo",
      "manifest",
      "manifestDetails",
      "projectRoot"
    );
  });
  it("getFileUri", async () => {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.cap,
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
        type: ProjectType.cap,
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
        type: ProjectType.cap,
        npmInstall: false,
      },
    };
    const testFramework = new TestFramework(useConfig);
    const content = ' <Page id="Main" title="⇶">';
    const result = testFramework.getOffset(content);
    expect(result).to.equal(24);
  });
});
