// Proxy — sets X-NEXT-INTL-LOCALE header from NEXT_LOCALE cookie for next-intl's getLocale()
// This app does NOT use [locale] directory structure, so we set the header manually
// instead of using createMiddleware (which would rewrite /→/vi causing 404s)

import { NextResponse, type NextRequest } from 'next/server';

const SUPPORTED_LOCALES = ['vi', 'en'];
const DEFAULT_LOCALE = 'vi';
const LOCALE_HEADER = 'X-NEXT-INTL-LOCALE';
const LOCALE_COOKIE = 'NEXT_LOCALE';

export function proxy(request: NextRequest) {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = SUPPORTED_LOCALES.includes(cookieLocale ?? '') ? cookieLocale! : DEFAULT_LOCALE;

  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',],
};
