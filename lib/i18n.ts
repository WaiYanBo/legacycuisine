import en from '../locales/en.json';
import ms from '../locales/ms.json';

export type Locale = 'en' | 'ms' | 'bm';

const dictionaries = {
  en,
  ms,
  bm: ms, // alias bm to ms
};

export function getDictionary(locale: Locale = 'en') {
  const norm = locale.toLowerCase() as Locale;
  return dictionaries[norm] || dictionaries.en;
}
