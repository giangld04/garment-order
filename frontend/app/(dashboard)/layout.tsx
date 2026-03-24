'use client';

// Dashboard layout — sidebar + header + content with auth guard
// Mobile: Sheet-based sidebar; Desktop: fixed sidebar

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import HeaderBar from '@/components/layout/header-bar';
import SidebarMenu from '@/components/layout/sidebar-menu';
import { getUser, isAuthenticated } from '@/lib/auth-utils';
import type { User } from '@/types/user';
import type { UserRole } from '@/lib/constants';
import { useLocale } from 'next-intl';

// Cookie key used to persist locale preference
const LOCALE_COOKIE = 'NEXT_LOCALE';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentLocale = useLocale();

  const [user, setUser] = useState<User | null>(null);
  const [locale, setLocale] = useState(currentLocale);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Auth guard: redirect to login if no token
  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setUser(getUser());
  }, [router]);

  // Toggle between 'vi' and 'en', persist in cookie for next-intl
  const handleLocaleToggle = () => {
    const next = locale === 'vi' ? 'en' : 'vi';
    setLocale(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    // Reload to apply new locale messages
    window.location.reload();
  };

  // Don't render until mounted (prevents SSR mismatch with localStorage)
  if (!mounted) return null;

  // Redirect in progress — don't flash content
  if (!isAuthenticated()) return null;

  const userRole = (user?.role ?? null) as UserRole | null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:bg-sidebar">
        <div className="p-4 font-bold text-sidebar-foreground border-b border-sidebar-border">
          May Mặc
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarMenu userRole={userRole} />
        </div>
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0 bg-sidebar">
          <SheetHeader className="p-4 border-b border-sidebar-border">
            <SheetTitle className="text-sidebar-foreground text-left">May Mặc</SheetTitle>
          </SheetHeader>
          <SidebarMenu userRole={userRole} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <HeaderBar
          user={user}
          locale={locale}
          onLocaleToggle={handleLocaleToggle}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
        <Separator />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
