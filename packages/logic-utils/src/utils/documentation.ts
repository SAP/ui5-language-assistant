import { UI5DeprecatedInfo } from "@ui5-language-assistant/semantic-model-types";
import { ReplaceFunction, forEach, unescape, concat, includes } from "lodash";

export function getDeprecationPlainTextSnippet({
  title,
  deprecatedInfo,
  modelVersion,
}: {
  title?: string;
  deprecatedInfo: UI5DeprecatedInfo;
  modelVersion: string | undefined;
}): string {
  let text = deprecatedInfo.text;
  if (text !== undefined) {
    text = convertJSDocToPlainText(text, modelVersion);
    // Only take the first line.
    // Multi-line problems are displayed open in the problem view which makes less problems visible unless the user
    // explicitly closes them.
    // For the full deprecation message the user can hover over the tag/attribute.
    // Note: long lines are displayed with "..." in the problems view and the user can hover over the problem to see
    // the full text.
    if (includes(text, "\n")) {
      text = text.substring(0, text.indexOf("\n")) + " ...";
    }
  }

  const doc = getDeprecationMessage({
    title,
    since: deprecatedInfo.since,
    text,
  });
  return doc;
}

export function getDeprecationMessage({
  title,
  since,
  text,
}: {
  title?: string;
  since: string | undefined;
  text: string | undefined;
}): string {
  let contents = title ?? "Deprecated";
  contents += since ? ` since version ${since}` : "";
  contents += ".";
  contents += text ? ` ${text}` : "";
  return contents;
}

// Exported for testing purpose
export function convertJSDocToPlainText(
  jsdocDescription: string,
  modelVersion: string | undefined
): string {
  return convertJSDoc(jsdocDescription, "plaintext", modelVersion);
}

export function convertJSDocToMarkdown(
  jsdocDescription: string,
  modelVersion: string | undefined
): string {
  return convertJSDoc(jsdocDescription, "markdown", modelVersion);
}

type ConvertTarget = "markdown" | "plaintext";

// The replacements are applied in order
const tagMatcherToReplacement: {
  matcher: RegExp;
  replacement: Record<ConvertTarget, string | ReplaceFunction>;
}[] = [
  // Italics
  {
    matcher: /<i>(.+?)<\/i>/g,
    replacement: { markdown: "*$1*", plaintext: "$1" },
  },

  // Bold
  {
    matcher: /<b>(.+?)<\/b>/g,
    replacement: { markdown: "**$1**", plaintext: "$1" },
  },
  {
    matcher: /<strong>(.+?)<\/strong>/g,
    replacement: { markdown: "**$1**", plaintext: "$1" },
  },

  // Emphasis
  {
    matcher: /<em>(.+?)<\/em>/g,
    replacement: { markdown: "***$1***", plaintext: "$1" },
  },

  // Headers
  {
    matcher: /<h1>(.+?)<\/h1>/g,
    replacement: { markdown: "\n# $1\n\n", plaintext: "\n$1\n" },
  },
  {
    matcher: /<h2>(.+?)<\/h2>/g,
    replacement: { markdown: "\n## $1\n\n", plaintext: "\n$1\n" },
  },
  {
    matcher: /<h3>(.+?)<\/h3>/g,
    replacement: { markdown: "\n### $1\n\n", plaintext: "\n$1\n" },
  },
  {
    matcher: /<h4>(.+?)<\/h4>/g,
    replacement: { markdown: "\n#### $1\n\n", plaintext: "\n$1\n" },
  },

  // Lists
  {
    matcher: /<li>(.+?)<\/li>/g,
    replacement: { markdown: "\n* $1", plaintext: "\n* $1" },
  },
  { matcher: /<ul>/g, replacement: { markdown: "", plaintext: "" } },
  { matcher: /<\/ul>/g, replacement: { markdown: "\n\n", plaintext: "\n" } },
  // TODO should we handle ordered lists (ol)?

  // Code value
  {
    matcher: /<code>(.+?)<\/code>/g,
    replacement: { markdown: "`$1`", plaintext: "$1" },
  },

  // Code block
  {
    matcher: /<pre>([^]+?)<\/pre>/g,
    replacement: {
      markdown: "\n```javascript\n$1```\n",
      plaintext: "\n$1\n",
    },
  },

  // Line break
  { matcher: /<br\/>/g, replacement: { markdown: "\n", plaintext: "\n" } },
  { matcher: /<br>/g, replacement: { markdown: "\n", plaintext: "\n" } },
  { matcher: /<\/br>/g, replacement: { markdown: "\n", plaintext: "\n" } },

  // HTML Escaping, e.g. "&lt;View" --> "<View"
  // Note: this doesn't replace all html-encoded characters, only the most common ones
  {
    matcher: /.*/gm,
    replacement: { markdown: unescape, plaintext: unescape },
  },
];

function convertJSDoc(
  jsdoc: string,
  target: ConvertTarget,
  modelVersion: string | undefined
): string {
  // We add replacements that require the model here (because they cannot be in tagMatcherToReplacement which is defined
  // outside of the function).
  // Note that they are applied after the replacements defined in tagMatcherToReplacement.
  const allTagMatcherToReplacement = concat(tagMatcherToReplacement, [
    // Links
    // Assuming links are of the form: {@link <type>[ <text>]}
    // Where the type doesn't contain whitespace, and neither the type nor text contain the "}" character
    {
      matcher: /{@link (([^\s}]+)\s)?([^}]+)}/g,
      replacement: {
        markdown: (all, _, type, text): string => {
          return `[${text}](${getLink(modelVersion, type ?? text)})`;
        },
        plaintext: "$3",
      },
    },
  ]);

  let contents = jsdoc;
  forEach(allTagMatcherToReplacement, (_) => {
    contents = replace(contents, _.matcher, _.replacement[target]);
  });

  return contents;
}

function replace(
  string: string,
  matcher: RegExp,
  replacement: string | ReplaceFunction
): string {
  // @ts-expect-error - 'replace' is defined with 2 overloads instead of a union type in the definitions file
  return string.replace(matcher, replacement);
}

export function getLink(
  modelVersion: string | undefined,
  link: string
): string {
  if (link.startsWith("http:") || link.startsWith("https:")) {
    return link;
  }
  if (modelVersion) {
    return `https://sapui5.hana.ondemand.com/${modelVersion}/#/api/${link}`;
  }
  return `https://sapui5.hana.ondemand.com/#/api/${link}`;
}
