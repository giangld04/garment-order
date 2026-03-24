import { defineRouting } from 'next-intl/routing';

// Routing configuration for next-intl
// Supports Vietnamese (default) and English
export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
});
