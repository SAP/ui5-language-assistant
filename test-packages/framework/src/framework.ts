import { Position, Range } from "vscode-languageserver-types";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { URI } from "vscode-uri";
import {
  npmInstall,
  deleteCopy,
  createCopy,
  fileExits,
  fileExitsSync,
  print,
} from "./utils";
import {
  getManifestDetails,
  ProjectKind,
  Manifest,
  getUI5Manifest,
  Context,
  getContext,
} from "@ui5-language-assistant/context";
import {
  TestFrameworkAPI,
  ProjectInfo,
  Config,
  ReadFileResult,
  ProjectData,
} from "./types";

export class TestFramework implements TestFrameworkAPI {
  private projectInfo: ProjectInfo;
  private _offset: number;
  constructor(config: Config) {
    this._offset = 0;
    this.projectInfo = config.projectInfo;
    if (this.projectInfo.deleteBeforeCopy) {
      this.deleteProjectsCopy();
    }
    this.createProjectsCopy();

    if (this.projectInfo.npmInstall) {
      this.npmInstall();
    }
  }
  get offset() {
    return this._offset;
  }
  set offset(data: number) {
    this._offset = data;
  }
  /**
   * path to project folder
   */
  private getProjectsSource(): string {
    return join(__dirname, "..", "..", "projects");
  }
  private deleteProjectsCopy(): void {
    const srcDir = `${this.getProjectsSource()}-copy`;
    deleteCopy(srcDir);
  }
  private nodeModulesExits(): boolean {
    const root = this.getProjectRoot();
    const modulePath = join(root, "node_modules");
    if (fileExitsSync(modulePath)) {
      return true;
    }
    return false;
  }
  private createProjectsCopy(): void {
    const srcDir = this.getProjectsSource();
    createCopy(srcDir);
  }
  private npmInstall() {
    if (this.nodeModulesExits()) {
      print("Skipping npm install as node_modules exits");
      return;
    }
    npmInstall(this.getProjectRoot());
  }
  public getProjectRoot(): string {
    const { name } = this.projectInfo;
    return join(__dirname, "..", "..", "projects-copy", name);
  }
  public getContext(
    documentPath?: string,
    modelCachePath?: string
  ): Promise<Context> {
    const projectRoot = this.getProjectRoot();
    documentPath =
      documentPath ??
      join(
        projectRoot,
        "app",
        "manage_travels",
        "webapp",
        "ext",
        "main",
        "Main.view.xml"
      );
    return getContext(documentPath, modelCachePath);
  }
  public async updateFile(
    pathSegments: string[],
    content: string,
    position?: Position
  ): Promise<void> {
    const root = this.getProjectRoot();
    const filePath = join(root, ...pathSegments);
    const exits = await fileExits(filePath);
    if (!exits) {
      throw `File ${filePath} is not existing`;
    }
    if (position) {
      const existingContent = await readFile(filePath, "utf-8");
      const contentPart = existingContent.split("\n");
      const startContent = contentPart.slice(0, position.line).join("\n");
      const endContent = contentPart.slice(position.line + 1).join("\n");
      const addedContent = `${contentPart[position.line].slice(
        0,
        position.character
      )}${content}${contentPart[position.line].slice(position.character)}`;
      const newContent = [startContent, addedContent, endContent].join("\n");
      content = newContent;
    }
    const offset = this.getOffset(content);
    this.offset = offset;
    content = content.replace(/⇶/, "");
    await writeFile(filePath, content);
  }
  public async readFile(
    pathSegments: string[],
    range?: Range
  ): Promise<ReadFileResult> {
    const root = this.getProjectRoot();
    const filePath = join(root, ...pathSegments);
    if (!fileExits(filePath)) {
      throw `File ${filePath} is not existing`;
    }
    let content = await readFile(filePath, "utf-8");
    if (range) {
      const contentPart = content.split("\n");
      const startContent = contentPart[range.start.line].slice(
        range.start.character
      );
      const endContent = contentPart[range.end.line].slice(
        0,
        range.end.character
      );
      const betweenContent = contentPart
        .slice(range.start.line + 1, range.end.line)
        .join("\n");
      content = [startContent, betweenContent, endContent].join("\n");
    }
    const { cst, tokenVector } = parse(content);
    const docCst = cst as DocumentCstNode;
    const ast = buildAst(docCst, tokenVector);
    return {
      content,
      cst: docCst,
      ast,
      tokenVector,
      offset: this.offset,
    };
  }
  public async getProjectData(): Promise<ProjectData> {
    const projectRoot = this.getProjectRoot();
    const appRoot = join(projectRoot, "app", "manage_travels", "webapp");
    const manifestRoot = join(appRoot, "manifest.json");
    const manifest = (await getUI5Manifest(manifestRoot)) as Manifest;
    const documentPath = join(
      projectRoot,
      "app",
      "manage_travels",
      "webapp",
      "ext",
      "main",
      "Main.view.xml"
    );
    const manifestDetails = await getManifestDetails(documentPath);
    const projectInfo: { type: "UI5" | "CAP"; kind: ProjectKind } = {
      type: "CAP",
      kind: "NodeJS",
    };
    return { projectInfo, manifest, manifestDetails, appRoot, projectRoot };
  }

  public getFileUri(pathSegments: string[]): string {
    const root = this.getProjectRoot();
    const pathData = join(root, ...pathSegments);
    return URI.file(pathData).toString();
  }
  public async getFileContent(pathSegments: string[]): Promise<string> {
    const root = this.getProjectRoot();
    const filePath = join(root, ...pathSegments);
    return await readFile(filePath, "utf-8");
  }
  public getOffset(content: string): number {
    let offset = 0;
    if (content.indexOf("⇶") === -1) {
      return offset;
    }
    return content.indexOf("⇶");
  }
}
