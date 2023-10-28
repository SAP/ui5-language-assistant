import { findRange, typesToValue } from "../../../utils";
import {
  BindingInfoElement,
  BindContext,
  BINDING_ISSUE_TYPE,
  BindingIssue,
} from "../../../types";
import { Range } from "vscode-languageserver-types";
import { t } from "../../../i18n";

export const createMissMatchValueIssue = (param: {
  context: BindContext;
  bindingElement: BindingInfoElement;
  ranges: (Range | undefined)[];
  forDiagnostic?: boolean;
}): BindingIssue => {
  const { context, bindingElement, ranges } = param;
  const data = typesToValue({
    types: bindingElement.type,
    context,
    forDiagnostic: true,
  });
  /* istanbul ignore next */
  const message =
    data.length > 1
      ? t("ALLOWED_VALUES_ARE", { data: data.join(t("OR")) })
      : t("ALLOWED_VALUES_IS", { data: data.join(t("OR")) });
  return {
    issueType: BINDING_ISSUE_TYPE,
    kind: "MissMatchValue",
    message,
    range: findRange(ranges),
    severity: "error",
  };
};
