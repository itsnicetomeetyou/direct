'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/mobile/dashboard/home', label: 'Home', icon: Home },
  { href: '/mobile/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/mobile/dashboard/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className={cn('h-5 w-5', active && 'text-primary')} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
