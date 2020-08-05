import { XMLDocument } from "@xml-tools/ast";
import { OffsetRange } from "@ui5-language-assistant/logic-utils";
import { QuickFixStableIdInfo } from "./src/quick-fix-stable-id";

export declare function computeQuickFixStableIdInfo(
  xmlDoc: XMLDocument,
  errorOffset: OffsetRange
): QuickFixStableIdInfo | undefined;
