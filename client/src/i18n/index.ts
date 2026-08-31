import en from './en.json';
import ur from './ur.json';
import romanUrdu from './romanUrdu.json';
import type { Language } from '../types';

type TranslationDict = typeof en;

const translations: Record<Language, TranslationDict> = {
  en,
  ur,
  'roman-urdu': romanUrdu,
};

type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<TranslationDict>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return the key itself as fallback
    }
  }
  return typeof current === 'string' ? current : path;
}

export function getTranslation(language: Language, key: string): string {
  const dict = translations[language] || translations.en;
  return getNestedValue(dict as unknown as Record<string, unknown>, key);
}
