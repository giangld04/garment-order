'use client';

// Sidebar navigation menu — role-based visibility, highlights active route

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Factory,
  BarChart2,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MENU_ITEMS } from '@/lib/constants';
import type { UserRole } from '@/lib/constants';

// Map icon name string to actual Lucide component
const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Factory,
  BarChart2,
  FileText,
};

interface SidebarMenuProps {
  userRole: UserRole | null;
  onNavigate?: () => void; // called after navigation (e.g., close mobile sheet)
}

export default function SidebarMenu({ userRole, onNavigate }: SidebarMenuProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const visibleItems = MENU_ITEMS.filter(
    (item) => item.roles === null || (userRole && item.roles.includes(userRole))
  );

  return (
    <nav className="flex flex-col gap-1 px-2 py-4">
      {visibleItems.map((item) => {
        const Icon = ICONS[item.icon] ?? LayoutDashboard;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{t(item.key as Parameters<typeof t>[0])}</span>
          </Link>
        );
      })}
    </nav>
  );
}
