import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import es from './locales/es.json';

const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// No manual switcher on mobile (by design) — the app follows the phone's own language
// setting, same as most native apps. Falls back to English for any language the app
// doesn't have a translation for.
const deviceLanguage = Localization.getLocales()[0]?.languageCode;
const initialLanguage: SupportedLanguage = (SUPPORTED_LANGUAGES as readonly string[]).includes(deviceLanguage ?? '')
  ? (deviceLanguage as SupportedLanguage)
  : 'en';

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18next;
