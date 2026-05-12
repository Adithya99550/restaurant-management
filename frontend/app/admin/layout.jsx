'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, Utensils, Users, Grid3X3, LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const navItems = [
  { href: '/admin/analytics', label: 'Analytics', icon: LayoutDashboard },
  { href: '/admin/menu', label: 'Menu', icon: Utensils },
  { href: '/admin/staff', label: 'Staff', icon: Users },
  { href: '/admin/tables', label: 'Tables', icon: Grid3X3 },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!auth?.user || auth.user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [auth, loading, router]);

  if (loading || !auth?.user || auth.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-display font-bold text-primary">Admin Panel</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}