import { forEach, find, get } from "lodash";

type LibraryFix = (libraryName: string, content: unknown) => void;
const libraryFixes: LibraryFix[] = [addViewDefaultAggregation];

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
