import { Position, Range } from "vscode-languageserver-types";
import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { getContextForFile } from "@ui5-language-assistant/language-server";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst, XMLDocument } from "@xml-tools/ast";
import { IToken } from "chevrotain";
import { URI } from "vscode-uri";
import { getSuggestions, SuggestionProviders } from "@xml-tools/content-assist";
import {
  npmInstall,
  deleteCopy,
  createCopy,
  fileExits,
  fileExitsSync,
  print,
} from "./utils";
import { UI5XMLViewCompletion } from "@ui5-language-assistant/xml-views-completion";
interface TestUtil {}
export enum ProjectName {
  cap = "cap",
}
export enum ProjectType {
  ui5 = "ui5",
  cap = "cap",
}

export interface ProjectInfo {
  name: ProjectName;
  type: ProjectType;
  deleteBeforeCopy?: boolean;
  npmInstall?: boolean;
}

export interface Config {
  projectInfo: ProjectInfo;
}
export interface ReadFileResult {
  content: string;
  cst: DocumentCstNode;
  ast: XMLDocument;
  tokenVector: IToken[];
  offset: number;
}
export interface SuggestionParams {
  offset: number;
  cst: DocumentCstNode;
  ast: XMLDocument;
  tokenVector: IToken[];
  context: AppContext;
  providers: SuggestionProviders<UI5XMLViewCompletion, AppContext>;
}
export class TestUtils implements TestUtil {
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
  /**
   * path to copied project root
   */
  public getProjectRoot(): string {
    const { name } = this.projectInfo;
    return join(__dirname, "..", "..", "projects-copy", name);
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
  public getSuggestions({
    cst,
    ast,
    context,
    offset,
    providers,
    tokenVector,
  }: SuggestionParams): UI5XMLViewCompletion[] {
    return getSuggestions<UI5XMLViewCompletion, AppContext>({
      offset,
      cst,
      ast,
      tokenVector,
      context,
      providers,
    });
  }
  /**
   * Segments to a file i.e view.xml
   * @param segments
   * @returns
   */
  public getFileUri(segments: string[]): string {
    const root = this.getProjectRoot();
    const pathData = join(root, ...segments);
    return URI.file(pathData).toString();
  }
  public getOffset(content: string): number {
    let offset = 0;
    if (content.indexOf("⇶") === -1) {
      return offset;
    }
    return content.indexOf("⇶");
  }
  public getContextForFile(
    uri: string,
    modelCachePath?: string
  ): Promise<AppContext> {
    return getContextForFile(uri, modelCachePath);
  }
  public getModelCachePath(): string {
    return join(__dirname, "..", "..", ".model-cache");
  }
}
