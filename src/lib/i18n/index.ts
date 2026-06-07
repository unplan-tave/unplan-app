import { ko, type TranslationKey } from '@/translations/ko';

const translations = {
  ko,
} as const;

export type Locale = keyof typeof translations;

let currentLocale: Locale = 'ko';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: TranslationKey): string {
  return translations[currentLocale][key];
}
