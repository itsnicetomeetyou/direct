import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { getPermissionsForRole } from '@/server/settings';
import { navItems } from '@/constants/data';
import { NavItem } from '@/types';

export const metadata: Metadata = {
  title: 'DiReCT Dashboard',
  description: 'DiReCT Academic Document Management System'
};

function filterNavItems(items: NavItem[], allowedTabs: string[]): NavItem[] {
  return items
    .map((item) => {
      // Always keep Logout
      if (item.label === 'logout') return item;

      // Check if this item's label is in the allowed tabs
      const isAllowed = allowedTabs.includes(item.label || '');

      if (item.children) {
        const filteredChildren = item.children.filter(
          (child) => allowedTabs.includes(child.label || '')
        );
        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      }

      return isAllowed ? item : null;
    })
    .filter(Boolean) as NavItem[];
}

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let filteredItems = navItems;

  try {
    const session = await auth();
    const role = (session?.user as any)?.role || 'ADMIN';
    const allowedTabs = await getPermissionsForRole(role);
    if (allowedTabs && allowedTabs.length > 0) {
      filteredItems = filterNavItems(navItems, allowedTabs);
    }
  } catch (error) {
    // If permissions can't be loaded, show all nav items (fallback)
    console.error('Failed to load role permissions:', error);
  }

  return (
    <div className="flex">
      <Sidebar navItems={filteredItems} />
      <main className="w-full flex-1 overflow-hidden">
        <Header navItems={filteredItems} />
        {children}
      </main>
    </div>
  );
}
