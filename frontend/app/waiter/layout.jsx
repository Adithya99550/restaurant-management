'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Utensils, ClipboardList, User, LogOut, ChefHat } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const navItems = [
  { href: '/waiter', label: 'Tables', icon: LayoutGrid },
  { href: '/waiter/orders', label: 'Orders', icon: ClipboardList },
];

export default function WaiterLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!auth?.user || auth.user.role !== 'WAITER')) {
      router.push('/login');
    }
  }, [auth, loading, router]);

  if (loading || !auth?.user || auth.user.role !== 'WAITER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          <span className="text-stone-500 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-stone-100 z-50">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="font-display text-xl text-stone-900">Waiter</h1>
              <p className="text-xs text-stone-400">Floor Service</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <motion.a
                  key={item.href}
                  href={item.href}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm">{item.label}</span>
                </motion.a>
              );
            })}
          </nav>

          {/* User */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-amber-700" />
              </div>
              <span className="text-sm font-medium text-stone-700">{auth.user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20 p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}