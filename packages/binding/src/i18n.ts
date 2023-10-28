import type { i18n, TFunction } from "i18next";
import { DEFAULT_I18N_NAMESPACE } from "@ui5-language-assistant/context";
import i18nEn from "./i18n/i18n.json";
import i18next from "i18next";

export function initI18n(i18nInstance: i18n): void {
  i18nInstance.addResourceBundle(
    i18nInstance.language,
    DEFAULT_I18N_NAMESPACE,
    i18nEn
  );
}

export const adaptTranslatedText = (text: string): string => {
  if (/&quot;/.test(text)) {
    text = text.replace(/&quot;/g, '"');
  }
  if (/&#39;/.test(text)) {
    text = text.replace(/&#39;/g, "'");
  }
  if (/&amp;quot;/.test(text)) {
    text = text.replace(/&amp;quot;/g, "&quot;");
  }
  return text;
};

export const t: TFunction = (key: string, ...args) => {
  const result = i18next.t(key, ...args);
  return adaptTranslatedText(result);
};
