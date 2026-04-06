## Phase Implementation Report

### Executed Phase
- Phase: phase-04-frontend-auth-layout
- Plan: /Users/giang/plans/260324-1039-garment-order-management
- Status: completed

### Files Modified
- `/Users/giang/Documents/Giang-Project/Test/frontend/app/layout.tsx` — updated root layout with next-intl NextIntlClientProvider (34 lines)
- `/Users/giang/Documents/Giang-Project/Test/frontend/i18n/routing.ts` — added `localePrefix: 'never'` (9 lines)

### Files Created
- `/Users/giang/Documents/Giang-Project/Test/frontend/types/user.ts` — User, LoginRequest, TokenResponse interfaces (19 lines)
- `/Users/giang/Documents/Giang-Project/Test/frontend/lib/auth-utils.ts` — JWT token localStorage helpers with SSR guards (48 lines)
- `/Users/giang/Documents/Giang-Project/Test/frontend/lib/api-client.ts` — Axios instance with request/response interceptors for JWT attach and 401 refresh (52 lines)
- `/Users/giang/Documents/Giang-Project/Test/frontend/lib/constants.ts` — MENU_ITEMS array, ROLE_LABELS, MenuItem/UserRole types (63 lines)
- `/Users/giang/Documents/Giang-Project/Test/frontend/app/(auth)/layout.tsx` — centered flex layout for auth pages (8 lines)
- `/Users/giang/Documents/Giang-Project/Test/frontend/app/(auth)/login/page.tsx` — login page (server component, 11 lines)
- `/Users/giang/Documents/Giang-Project/Test/frontend/components/auth/login-form.tsx` — login form with card, inputs, error display, API call (89 lines)
- `/Users/giang/Documents/Giang-Project/Test/frontend/app/(dashboard)/layout.tsx` — dashboard layout with desktop sidebar + mobile Sheet, auth guard, locale toggle (84 lines)
- `/Users/giang/Documents/Giang-Project/Test/frontend/app/(dashboard)/page.tsx` — dashboard placeholder page (10 lines)
- `/Users/giang/Documents/Giang-Project/Test/frontend/components/layout/sidebar-menu.tsx` — nav menu with role-based visibility, active route highlight, lucide icons (62 lines)
- `/Users/giang/Documents/Giang-Project/Test/frontend/components/layout/header-bar.tsx` — header with user info, role badge, language toggle, logout (68 lines)
- `/Users/giang/Documents/Giang-Project/Test/frontend/proxy.ts` — Next.js 16 proxy (replaces deprecated middleware.ts) for next-intl locale detection (21 lines)

### Files Deleted
- `/Users/giang/Documents/Giang-Project/Test/frontend/app/page.tsx` — removed; would conflict with `(dashboard)/page.tsx` at route `/`

### Tasks Completed
- [x] Create TypeScript types (user.ts)
- [x] Implement auth-utils.ts (token storage helpers)
- [x] Implement api-client.ts (Axios with interceptors)
- [x] Create root layout with next-intl (shadcn/Tailwind, not Ant Design)
- [x] Create auth layout (centered card)
- [x] Create login page with shadcn/ui Card + Input + Button
- [x] Implement login API call + token storage + redirect
- [x] Create dashboard layout with mobile Sheet sidebar + fixed desktop sidebar
- [x] Create sidebar menu with Vietnamese/English labels + route links + role-based visibility
- [x] Create header bar with user info + role badge + language toggle + logout
- [x] Implement client-side auth guard (redirect if unauthenticated)
- [x] Implement role-based menu visibility
- [x] Update i18n routing to use `localePrefix: 'never'` (no URL prefix)
- [x] Use proxy.ts (Next.js 16 convention) instead of deprecated middleware.ts

### Tests Status
- Type check: pass (TypeScript clean)
- Build: pass (`bun run build` — 0 errors, 0 warnings)
- Routes compiled: `/` (dashboard home) and `/login`
- Unit tests: N/A (not in phase scope)

### Key Decisions
1. **No Ant Design** — task instruction overrode phase file; used shadcn/ui + Tailwind throughout
2. **proxy.ts not middleware.ts** — Next.js 16 deprecates `middleware` convention; proxy.ts suppresses the warning
3. **`localePrefix: 'never'`** — no /vi or /en URL prefix; locale stored in NEXT_LOCALE cookie; language toggle reloads page
4. **Auth guard client-side** — localStorage is unavailable during SSR; auth check runs in `useEffect` in `(dashboard)/layout.tsx`
5. **Deleted root app/page.tsx** — conflicted with `(dashboard)/page.tsx` both mapping to `/`

### Issues Encountered
- None blocking. Build and TypeScript pass cleanly.

### Next Steps
- Phase 5: Frontend CRUD Pages (customers, products, orders, production) — builds on this layout
- Phase 6: Dashboard & Statistics — fills in the `(dashboard)/page.tsx` placeholder
