import { forEach, find, get, remove } from "lodash";

type LibraryFix = (libraryName: string, content: unknown) => void;
const libraryFixes: LibraryFix[] = [
  addViewDefaultAggregation,
  fixSelfImplementingClass,
];

export function fixLibrary(libraryName: string, fileContent: unknown): void {
  forEach(libraryFixes, (fix) => {
    fix(libraryName, fileContent);
  });
}

// Exported for test purpose
export function addViewDefaultAggregation(
  libraryName: string,
  content: unknown
): void {
  const symbol = find(
    get(content, "symbols"),
    (symbol) => symbol.name === "sap.ui.core.mvc.View"
  );
  if (symbol !== undefined) {
    const metadata = get(symbol, "ui5-metadata");
    if (metadata !== undefined) {
      metadata.defaultAggregation = "content";
    }
  }
}

export function fixSelfImplementingClass(
  libraryName: string,
  content: unknown
): void {
  // This fixes class "sap.ui.vk.BaseNodeProxy" which has itself in its "implements" array
  forEach(get(content, "symbols"), (symbol) => {
    if (get(symbol, "kind") === "class") {
      const symbolName = get(symbol, "name");
      remove(symbol.implements, (name) => name === symbolName);
    }
  });
}
