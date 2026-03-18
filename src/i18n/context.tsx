import { createContext, useContext, useState, ReactNode } from 'react';
import enMessages from '../../messages/en.json';
import swMessages from '../../messages/sw.json';

type Locale = 'en' | 'sw' | 'fr';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

// Messages map
const messages: Record<Locale, Record<string, unknown>> = {
  en: enMessages,
  sw: swMessages,
  fr: enMessages, // Fallback to English for French
};

export function I18nProvider({ children, initialLocale = 'en' }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = async (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Save to cookie
    if (typeof document !== 'undefined') {
      document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = messages[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, locale, setLocale } = useI18n();
  return { t, locale, setLocale };
}

// Export locale info for use elsewhere
export const locales = ['en', 'sw', 'fr'] as const;
export const defaultLocale: Locale = 'en';
export const localeNames: Record<Locale, string> = {
  en: 'English',
  sw: 'Kiswahili',
  fr: 'Français',
};
