import { defineRouting } from 'next-intl/routing';

// Routing configuration for next-intl
// localePrefix: 'never' — no /vi or /en URL prefix, locale stored in cookie
export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'never',
});
