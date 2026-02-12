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
        // For parent items (like Settings), check if parent is allowed
        const filteredChildren = item.children.filter(
          (child) => allowedTabs.includes(child.label || '')
        );
        // Show parent if it has children AND parent label is allowed
        if (filteredChildren.length > 0 && isAllowed) {
          return { ...item, children: filteredChildren };
        }
        // If parent not explicitly controlled but has children, show it
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
  const session = await auth();
  const role = (session?.user as any)?.role || 'ADMIN';
  const allowedTabs = await getPermissionsForRole(role);
  const filteredItems = filterNavItems(navItems, allowedTabs);

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
