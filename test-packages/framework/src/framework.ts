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
  fileExitsSync,
  print,
  removeProjectContent,
} from "./utils";

import { TestFrameworkAPI, ProjectInfo, Config, ReadFileResult } from "./types";

export class TestFramework implements TestFrameworkAPI {
  private projectInfo: ProjectInfo;
  private _offset: number;
  constructor(config: Config) {
    this._offset = 0;
    this.projectInfo = config.projectInfo;
    const {
      deleteBeforeCopy = false,
      npmInstall = false,
      deleteProjectContent = true,
    } = config.projectInfo;
    if (deleteBeforeCopy) {
      this.deleteProjectsCopy();
    } else if (deleteProjectContent) {
      removeProjectContent(this.getProjectRoot());
    }
    this.createProjectsCopy();

    if (npmInstall) {
      this.npmInstall();
    }
  }
  get offset(): number {
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
  public async updateFile(
    pathSegments: string[],
    content: string,
    position?: Position
  ): Promise<void> {
    const root = this.getProjectRoot();
    const filePath = join(root, ...pathSegments);
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
    let content = await readFile(filePath, "utf-8");
    if (range) {
      const contentPart = content.split("\n");
      if (range.start.line === range.end.line) {
        // on same line
        const startEndContent = contentPart[range.start.line].slice(
          range.start.character,
          range.end.character + 1
        );
        content = [startEndContent].join("\n");
      } else {
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
    if (content.indexOf("⇶") === -1) {
      return 0;
    }
    return content.indexOf("⇶");
  }
}
