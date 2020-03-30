import {
  UI5SemanticModel,
  BaseUI5Node
} from "@ui5-language-assistant/semantic-model-types";
import { MarkupContent } from "vscode-languageserver";
import {
  getRootSymbolParent,
  ui5NodeToFQN
} from "@ui5-language-assistant/logic-utils";
import { GENERATED_LIBRARY } from "@ui5-language-assistant/semantic-model";

export function getNodeDocumentation(
  node: BaseUI5Node,
  model: UI5SemanticModel
): string | MarkupContent {
  // Note: most of this code was taken from ui5-typescript repository and adapted for better markdown support.
  // This should be consolidated in the future.
  let contents = "";
  const NL = "\n";
  const EMPTY_STRING = "";

  contents += node.since
    ? `Available since version ${node.since}.` + NL
    : EMPTY_STRING;

  if (node.deprecatedInfo?.isDeprecated) {
    // Since and Deprecated are both present
    if (contents !== "") {
      contents += NL;
    }
    contents += "Deprecated";
    /* istanbul ignore next */
    contents += node.deprecatedInfo.since
      ? ` since version ${node.deprecatedInfo.since}`
      : EMPTY_STRING;
    contents += ".";
    contents += node.deprecatedInfo.text
      ? ` ${node.deprecatedInfo.text}`
      : EMPTY_STRING;
    contents += NL;
  }
  // TODO add experimental when it's added to the model in this format: Experimental API [since version <since>]

  // Clearly separate annotations and regular doc block
  if (contents.length > 0) {
    contents += NL;
  }

  contents += node.description ? node.description + NL : EMPTY_STRING;

  const markdownContent = convertDescriptionToMarkup(contents, model);

  const symbolForDocumentation = getRootSymbolParent(node);
  /* istanbul ignore else */
  if (
    symbolForDocumentation !== undefined &&
    symbolForDocumentation.library !== GENERATED_LIBRARY
  ) {
    const link = getLink(model, ui5NodeToFQN(symbolForDocumentation));
    markdownContent.value += NL + `[More information](${link})` + NL;
  }

  return markdownContent;
}

function convertDescriptionToMarkup(
  jsdocDescription: string,
  model: UI5SemanticModel
): MarkupContent {
  let contents = jsdocDescription;

  // Italics
  contents = contents.replace(/<i>(.+?)<\/i>/g, "*$1*");

  // Bold
  contents = contents.replace(/<b>(.+?)<\/b>/g, "**$1**");
  contents = contents.replace(/<strong>(.+?)<\/strong>/g, "**$1**");

  // Emphasis
  contents = contents.replace(/<em>(.+?)<\/em>/g, "***$1***");

  // Headers
  contents = contents.replace(/<h1>(.+?)<\/h1>/g, "\n# $1\n\n");
  contents = contents.replace(/<h2>(.+?)<\/h2>/g, "\n## $1\n\n");
  contents = contents.replace(/<h3>(.+?)<\/h3>/g, "\n### $1\n\n");
  contents = contents.replace(/<h4>(.+?)<\/h4>/g, "\n#### $1\n\n");

  // Lists
  contents = contents.replace(/<li>(.+?)<\/li>/g, "\n* $1");
  contents = contents.replace(/<ul>/g, "");
  contents = contents.replace(/<\/ul>/g, "\n\n");
  // TODO should we handled ordered lists (ol)?

  // Code value
  contents = contents.replace(/<code>(.+?)<\/code>/g, "`$1`");

  // Code block
  contents = contents.replace(
    /<pre>([^]+?)<\/pre>/g,
    "\n```javascript\n$1```\n"
  );

  // Line break
  contents = contents.replace(/<br\/>/g, "\n");
  contents = contents.replace(/<br>/g, "\n");
  contents = contents.replace(/<\/br>/g, "\n");

  // "&lt;View" --> "<View"
  contents = unescape(contents);

  // Links
  // Assuming links are of the form: {@link <type>[ <text>]}
  // Where the type doesn't contain whitespace, and neither the type nor text contain the "}" character
  contents = contents.replace(
    /{@link (([^\s}]+)\s)?([^}]+)}/g,
    (all, _, type, text) => {
      /* istanbul ignore next */
      return `[${text}](${getLink(model, type ?? text)})`;
    }
  );

  return {
    kind: "markdown",
    value: contents
  };
}

function getLink(model: UI5SemanticModel, link: string): string {
  if (link.startsWith("http:") || link.startsWith("https:")) {
    return link;
  }
  /* istanbul ignore else */
  if (model.version) {
    return `https://sapui5.hana.ondemand.com/${model.version}/#/api/${link}`;
  }
  /* istanbul ignore next */
  return `https://sapui5.hana.ondemand.com/#/api/${link}`;
}
