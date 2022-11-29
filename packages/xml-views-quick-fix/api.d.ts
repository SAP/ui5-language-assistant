import { XMLDocument } from "@xml-tools/ast";
import { OffsetRange } from "@ui5-language-assistant/logic-utils";
import { QuickFixStableIdInfo } from "./src/quick-fix-stable-id";
import { QuickFixHardcodedI18nStringInfo } from "./src/quick-fix-hardcoded-i18n-string";
import { Property } from "properties-file";

export declare function computeQuickFixStableIdInfo(
  xmlDoc: XMLDocument,
  errorOffset: OffsetRange[]
): QuickFixStableIdInfo[];

export declare function computeQuickFixHardcodedI18nStringInfo(
  xmlDoc: XMLDocument,
  errorOffset: OffsetRange[],
  resourceBundle: Property[]
): QuickFixHardcodedI18nStringInfo[];
