import { DocumentCstNode } from "@xml-tools/parser";
import { Position, Range } from "vscode-languageserver-types";
import { XMLDocument } from "@xml-tools/ast";
import { IToken } from "chevrotain";

/**
 * Name of project folder
 */
export enum ProjectName {
  cap = "cap",
}
/**
 * Type of support project
 */
export enum ProjectType {
  ui5 = "ui5",
  cap = "cap",
}
/**
 * @param name project name
 * @param type project type
 * @param deleteBeforeCopy deletes project-copy folder before copying project. By default is false
 * @param npmInstall perform `npm install` in specified project. By default is false. If `node_modules` exits, npm install is skipped
 */
export interface ProjectInfo {
  name: ProjectName;
  type: ProjectType;
  deleteBeforeCopy?: boolean;
  npmInstall?: boolean;
}

/**
 * @param projectInfo information about project
 */
export interface Config {
  projectInfo: ProjectInfo;
}
/**
 * @param content file content
 * @param cst cst representation of file content
 * @param ast ast representation of file content
 * @param tokenVector token vector
 * @param offset offset of cursor position
 */
export interface ReadFileResult {
  content: string;
  cst: DocumentCstNode;
  ast: XMLDocument;
  tokenVector: IToken[];
  offset: number;
}
/**
 * @param projectRoot root of a project
 * @param appRoot root of an app
 * @param manifest manifest of an app
 * @param manifestDetails manifest details of an app
 * @param projectInfo information about project type and kind
 *
 */
export interface TestFrameworkAPI {
  /**
   * path to a root of a copied project
   */
  getProjectRoot(): string;
  /**
   * Update a file with content. If `position` is provided, a portion of a file is updated, otherwise
   * content is overwritten
   *
   * @param pathSegments path segments to a file starting from project root
   * @param content content to write. Content may contain `⇶` placeholder. `⇶` placeholder will be clean before content is written in file system and offset is stored in `getter offset` instance of test utils
   * @param position position information
   */
  updateFile(
    pathSegments: string[],
    content: string,
    position?: Position
  ): Promise<void>;
  /**
   * Read a file from project. If `range` is provided, a portion of a file is read
   *
   * @param pathSegments path segments to a file starting from project root
   * @param range range information
   */
  readFile(pathSegments: string[], range?: Range): Promise<ReadFileResult>;
  /**
   * Get a file URI i.e  `file:\\...`
   *
   * @param pathSegments path segments to a file starting from project root
   */
  getFileUri(pathSegments: string[]): string;
  /**
   * Get file content
   *
   * @param pathSegments path segments to a file starting from project root
   */
  getFileContent(pathSegments: string[]): Promise<string>;
  /**
   * Get offset base on `⇶` placeholder
   *
   * @param content file content. Content may contain `⇶` placeholder
   */
  getOffset(content: string): number;
}
