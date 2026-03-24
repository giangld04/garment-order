import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// next-intl server-side request configuration
// Loads message files for the active locale
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that locale is supported, fallback to default
  if (!locale || !routing.locales.includes(locale as 'vi' | 'en')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
