// Proxy (formerly middleware) — handles next-intl locale detection from NEXT_LOCALE cookie
// Auth guard is handled client-side in dashboard layout (localStorage-based)
// Note: next-intl 4.8.3 still exports createMiddleware; aliased to proxy here

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Named export required by Next.js 16 proxy convention
export function proxy(request: Parameters<typeof intlMiddleware>[0]) {
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
