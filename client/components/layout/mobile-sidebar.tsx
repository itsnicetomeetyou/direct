'use client';
import { DashboardNav } from '@/components/dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { navItems as defaultNavItems } from '@/constants/data';
import { NavItem } from '@/types';
import { MenuIcon } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  navItems?: NavItem[];
}

export function MobileSidebar({ className, navItems }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const items = navItems || defaultNavItems;
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="focus:outline-none">
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left" className="!px-0">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Overview
              </h2>
              <div className="space-y-1">
                <DashboardNav
                  items={items}
                  isMobileNav={true}
                  setOpen={setOpen}
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
