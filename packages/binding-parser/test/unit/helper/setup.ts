import { promises, readdirSync, stat, statSync } from "fs";
import { join, dirname } from "path";
import { platform } from "os";
import type {
  IToken,
  CstNode,
  CstNodeLocation,
  CstElement,
  IRecognitionException,
} from "chevrotain";
import { deserialize } from "./deserialize-ast";
import type { Ast } from "../../../src/types/property-binding-info";
import { serialize } from "./serialize";

const { readFile } = promises;

const hasNaNOrUndefined = (value: undefined | number): boolean => {
  if (value === undefined) {
    return true;
  }
  return isNaN(value);
};

export const getBase = (): string => {
  if (process.env.TEST_UPDATE) {
    return join(__dirname, "..", "..", "..", "..", "test", "unit", "data");
  }
  return join(__dirname, "..", "..", "..", "test", "unit", "data");
};

export const getFileContent = async (filePath: string): Promise<string> => {
  const buffer = await readFile(filePath, "utf8");
  return buffer.toString();
};

export const getInput = async (testCasePath: string): Promise<string> => {
  const path = join(getBase(), testCasePath, "input.txt");
  return getFileContent(path);
};

export const getCst = async (testCasePath: string): Promise<CstNode> => {
  const path = join(getBase(), testCasePath, "cst.json");
  const content = await getFileContent(path);
  return deserialize<CstNode>(content);
};
export const getLexerErrors = async (
  testCasePath: string
): Promise<unknown> => {
  const path = join(getBase(), testCasePath, "lexer-errors.json");
  const content = await getFileContent(path);
  return JSON.parse(content);
};
export const getParserErrors = async (
  testCasePath: string
): Promise<unknown> => {
  const path = join(getBase(), testCasePath, "parse-errors.json");
  const content = await getFileContent(path);
  return JSON.parse(content);
};

export const getAst = async (testCasePath: string): Promise<Ast> => {
  const path = join(getBase(), testCasePath, "ast.json");
  const content = await getFileContent(path);
  return deserialize<Ast>(content);
};

const isCstNode = (node: CstNode | IToken): node is CstNode => {
  return (node as CstNode).children !== undefined;
};
const reduceLocationInfo = (location?: CstNodeLocation): void => {
  if (location) {
    if (hasNaNOrUndefined(location.startColumn)) {
      location.startColumn = -1;
    }
    if (hasNaNOrUndefined(location.endColumn)) {
      location.endColumn = -1;
    }
    delete location.startLine;
    delete location.endLine;
    /*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/
    //@ts-ignore";
    delete location.startOffset;
    delete location.endOffset;
  }
};

const reduceTokenInfo = (token: IToken): void => {
  try {
    if (hasNaNOrUndefined(token.startColumn)) {
      token.startColumn = -1;
    }

    if (hasNaNOrUndefined(token.endColumn)) {
      token.endColumn = -1;
    }

    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    const tokenTypeName = (token as any).tokenTypeName;
    if (tokenTypeName && typeof tokenTypeName === "string") {
      /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
      (token as any).tokenTypeName = tokenTypeName;
    } else {
      /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
      (token as any).tokenTypeName = token.tokenType?.name;
    }
    delete token.startLine;
    delete token.endLine;
    /*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/
    // @ts-ignore
    delete token.startOffset;
    delete token.endOffset;
    /*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/
    //@ts-ignore
    delete token.tokenTypeIdx;
    /*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/
    //@ts-ignore
    delete token.tokenType;
    /*eslint-disable-next-line no-empty*/
  } catch (error) {
    console.log("failed to reduce token. Check method 'reduceTokenInfo'");
  }
};
export const transformCstForAssertion = (node: CstNode | IToken): void => {
  if (isCstNode(node)) {
    reduceLocationInfo(node.location);
    const allChildren = Object.keys(node.children).reduce(
      (acc: CstElement[], child) => [...acc, ...(node.children[child] ?? [])],
      []
    );
    for (const child of allChildren) {
      transformCstForAssertion(child);
    }
  } else if (typeof node.image === "string") {
    reduceTokenInfo(node);
  } else {
    throw Error("None Exhaustive Match");
  }
};
type ErrorTransform = Pick<
  IRecognitionException,
  "message" | "name" | "resyncedTokens" | "token"
> & { previousToken?: IToken };
export const transformParserErrorForAssertion = (
  nodes: (IRecognitionException & { previousToken?: IToken })[]
): ErrorTransform[] => {
  const result: ErrorTransform[] = [];
  for (const node of nodes) {
    if (node.token) {
      const data = deserialize<IToken>(serialize(node.token));
      transformCstForAssertion(data);
      node.token = data;
    }
    if (node.resyncedTokens) {
      const data = deserialize<IToken[]>(serialize(node.resyncedTokens));
      for (const resync of data) {
        transformCstForAssertion(resync);
      }
      node.resyncedTokens = data;
    }
    if (node.previousToken) {
      const data = deserialize<IToken>(serialize(node.previousToken));
      transformCstForAssertion(data);
      node.previousToken = data;
    }
    const data = deserialize<ErrorTransform>(
      serialize({
        token: node.token,
        message: node.message,
        name: node.name,
        resyncedTokens: node.resyncedTokens,
        previousToken: node.previousToken,
      })
    );
    result.push(data);
  }
  return result;
};

export const getAllNormalizeFolderPath = (
  base = getBase(),
  allFolderPath: string[] = []
): string[] => {
  const fileOrFolder = readdirSync(base);
  fileOrFolder.forEach(function (item: string) {
    const itemPath = join(base, item);
    if (statSync(itemPath).isDirectory()) {
      allFolderPath = getAllNormalizeFolderPath(itemPath, allFolderPath);
    } else {
      if (itemPath.endsWith(".txt")) {
        const dirPath = dirname(itemPath);
        const relativeLike = dirPath.split(getBase())[1];
        const normalizedPath = relativeLike.replace(
          platform() === "win32" ? /\\/g : /\//g,
          "/"
        );
        allFolderPath.push(normalizedPath);
      }
    }
  });

  return allFolderPath;
};

export const doesExits = (path: string): Promise<boolean> => {
  return new Promise((resolve) => {
    stat(path, (err) => {
      if (err) {
        resolve(false);
      }
      resolve(true);
    });
  });
};
