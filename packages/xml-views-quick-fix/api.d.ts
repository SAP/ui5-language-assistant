import { XMLDocument } from "@xml-tools/ast";
import { OffsetRange } from "@ui5-language-assistant/xml-views-validation";

type quickFixIdInfo = {
  quickFixIdSuggesion: string;
  quickFixIdOffsetRange: OffsetRange;
};

export declare function getQuickFixIdInfo(
  xmlDoc: XMLDocument,
  errorOffset: OffsetRange
): quickFixIdInfo | undefined;
