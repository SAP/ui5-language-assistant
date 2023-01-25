import type { i18n } from "i18next";
import { DEFAULT_I18N_NAMESPACE } from "@ui5-language-assistant/context";
import i18nEn from "./i18n/i18n.json";

export function initI18n(i18nInstance: i18n): void {
  i18nInstance.addResourceBundle(
    i18nInstance.language,
    DEFAULT_I18N_NAMESPACE,
    i18nEn
  );
}
