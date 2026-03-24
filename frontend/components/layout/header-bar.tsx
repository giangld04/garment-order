'use client';

// Header bar — displays app name, user info, language toggle, and logout

import { useTranslations } from 'next-intl';
import { LogOut, Globe, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clearAuth } from '@/lib/auth-utils';
import { ROLE_LABELS } from '@/lib/constants';
import type { User } from '@/types/user';
import { useRouter } from 'next/navigation';

interface HeaderBarProps {
  user: User | null;
  locale: string;
  onLocaleToggle: () => void;
  onMobileMenuOpen: () => void;
}

export default function HeaderBar({
  user,
  locale,
  onLocaleToggle,
  onMobileMenuOpen,
}: HeaderBarProps) {
  const t = useTranslations('common');
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      {/* Mobile: hamburger menu trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMobileMenuOpen}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* App name (desktop) */}
      <span className="hidden md:block text-sm font-semibold text-muted-foreground">
        {t('appName')}
      </span>

      {/* Right section: user info + controls */}
      <div className="flex items-center gap-3 ml-auto">
        {user && (
          <>
            <span className="hidden sm:block text-sm font-medium">{user.username}</span>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {ROLE_LABELS[user.role]}
            </Badge>
          </>
        )}

        {/* Language toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onLocaleToggle}
          title={locale === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        >
          <Globe className="size-4" />
          <span className="sr-only">{locale.toUpperCase()}</span>
        </Button>

        {/* Logout */}
        <Button variant="ghost" size="icon" onClick={handleLogout} title={t('logout')}>
          <LogOut className="size-4" />
          <span className="sr-only">{t('logout')}</span>
        </Button>
      </div>
    </header>
  );
}
