import { DocumentCstNode } from "@xml-tools/parser";
import { Position, Range } from "vscode-languageserver-types";
import { XMLDocument } from "@xml-tools/ast";
import { IToken } from "chevrotain";
import { i18n, ResourceKey } from "i18next";

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
  UI5 = "UI5",
  CAP = "CAP",
}
/**
 * @param name project name
 * @param type project type
 * @param deleteBeforeCopy deletes project-copy folder before copying project. By default is false
 * @param deleteProjectContent delete all contents of a project except `node_modules` and `package-lock.json` before copying contents. By default is `true`
 * @param npmInstall perform `npm install` in specified project. By default is false. If `node_modules` exits, npm install is skipped
 */
export interface ProjectInfo {
  name: ProjectName;
  type: ProjectType;
  deleteBeforeCopy?: boolean;
  deleteProjectContent?: boolean;
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
  ): Promise<{ offset: number }>;
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

  /**
   * Updates file content
   * @param filePath - path of file to update
   * @param newText - new text to be written to the file
   * @param options - describes how the file should be updated
   *    - insertBefore: if provided, the new text is inserted before that fragment
   *    - insertAfter: if provided, the new text is inserted after that fragment
   *    - replaceText: if provided, the new text replaces that fragment
   *    - doUpdatesAfter: if provided then search for that fragment is done first and
   *                      if is found, then requested changes are made staring from position after it.
   *                      If not found, exception is thrown
   *      If options are omitted then new text is added to the end of file
   *
   * @param deleteCursorAnchors - (default = true ) if set to true then cursor anchors are removed from file before saving it
   *
   * returns - offset of first cursor anchor in the file content after applying requested changes
   */
  updateFileContent(
    relativePathSegments: string[],
    newText: string,
    options?: {
      insertBefore?: string;
      insertAfter?: string;
      replaceText?: string;
      doUpdatesAfter?: string;
    },
    deleteCursorAnchors?: boolean
  ): Promise<{ offset: number }>;

  /**
   * Initializes and returns i18n translation engine
   */
  initI18n(): Promise<i18n>;
}
