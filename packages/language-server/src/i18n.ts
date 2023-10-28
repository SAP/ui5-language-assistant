import i18next from "i18next";
import i18nEn from "./i18n/i18n.json";
import { initI18n as initFeI18n } from "@ui5-language-assistant/fe";
import { initI18n as initBindingI18n } from "@ui5-language-assistant/binding";
import { DEFAULT_I18N_NAMESPACE } from "@ui5-language-assistant/context";

export async function initI18n(language = "en"): Promise<void> {
  // Initialize i18next of ide-extension
  await i18next.init({
    resources: {
      en: {
        [DEFAULT_I18N_NAMESPACE]: i18nEn,
      },
    },
    lng: language,
    fallbackLng: "en",
    joinArrays: "\n\n",
  });

  // Initialize i18next of other packages
  await initFeI18n(i18next);
  await initBindingI18n(i18next);
}
