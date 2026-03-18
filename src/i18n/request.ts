import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['en', 'sw', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  sw: 'Kiswahili',
  fr: 'Français',
};

export default getRequestConfig(async () => {
  // Get locale from cookie or default
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get('locale')?.value as Locale | undefined;
  const locale = savedLocale && locales.includes(savedLocale) ? savedLocale : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
