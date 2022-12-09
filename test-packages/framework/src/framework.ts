import { Position, Range } from "vscode-languageserver-types";
import { TextDocumentPositionParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { URI } from "vscode-uri";
import {
  npmInstall,
  deleteProject,
  createCopy,
  fileExitsSync,
  print,
  removeProjectContent,
} from "./utils";

import { TestFrameworkAPI, ProjectInfo, Config, ReadFileResult } from "./types";
import { repeat } from "lodash";

export const CURSOR_ANCHOR = "⇶";

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
    deleteProject(srcDir);
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
    content = content.replace(new RegExp(CURSOR_ANCHOR, "g"), "");
    await writeFile(filePath, content);
  }

  /**
   * Updates file content
   * @param filePath - path of file to update
   * @param newText - new text to be written to the file
   * @param options - describes how the file should be updated
   *    - insertAfter: if provided the text is inserted after that fragment
   *    - replaceText: if provided the new text replaces that fragment
   * If options is omitted then new text is added to the end of file
   */
  public async updateFileContent(
    relativePathSegments: string[],
    newText: string,
    options?: {
      insertBefore?: string;
      insertAfter?: string;
      replaceText?: string;
      doUpdatesAfter?: string;
    },
    deleteCursorAnchors = true
  ): Promise<{ offset: number }> {
    const root = this.getProjectRoot();
    const filePath = join(root, ...relativePathSegments);

    const existingContent = await readFile(filePath, "utf-8");
    let contentToLookup = existingContent;
    if (options?.doUpdatesAfter) {
      const index = existingContent.indexOf(options.doUpdatesAfter);
      if (index > -1) {
        const startOffset = index + options.doUpdatesAfter.length;
        contentToLookup =
          repeat(" ", startOffset) + existingContent.slice(startOffset);
      } else {
        throw new Error(
          `Fragment "${options.doUpdatesAfter}" not found, file not updated: ${filePath}`
        );
      }
    }

    let newContent: string;
    const token =
      options?.insertAfter ||
      options?.insertBefore ||
      options?.replaceText ||
      "";
    const index = contentToLookup.indexOf(token || "");
    if (token && index >= 0) {
      if (options?.insertAfter) {
        const tokenLen = token.length;
        const offset = index + tokenLen;
        newContent =
          existingContent.slice(0, offset) +
          newText +
          existingContent.slice(offset);
      } else if (options?.insertBefore) {
        newContent =
          existingContent.slice(0, index) +
          newText +
          existingContent.slice(index);
      } else {
        const tokenLen = token.length;
        const offset = index + tokenLen;
        newContent =
          existingContent.slice(0, index) +
          newText +
          existingContent.slice(offset);
      }
    } else {
      newContent = `${existingContent}\n${newText}`;
    }

    const offset = newContent.indexOf(CURSOR_ANCHOR);

    if (offset > -1 && deleteCursorAnchors) {
      newContent = newContent.replace(new RegExp(CURSOR_ANCHOR, "g"), "");
    }
    await writeFile(filePath, newContent);
    return { offset };
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
    if (content.indexOf(CURSOR_ANCHOR) === -1) {
      return 0;
    }
    return content.indexOf(CURSOR_ANCHOR);
  }

  /**
   * Converts provided text into VSCode text document
   * @param uri - file uri string
   * @param content - file content
   * @param offset - optional offset
   * @returns - VSCode text document, document position parameters
   */
  public toVscodeTextDocument(
    uri: string,
    content: string,
    offset: number
  ): {
    document: TextDocument;
    textDocumentPosition: TextDocumentPositionParams;
  } {
    const document: TextDocument = TextDocument.create(uri, "", 1, content);
    const position = document.positionAt(offset);
    const textDocumentPosition: TextDocumentPositionParams = {
      position,
      textDocument: {
        uri,
      },
    };
    return { document, textDocumentPosition };
  }
}
