'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, BarChart3, DollarSign, User, LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const navItems = [
  { href: '/cashier', label: 'Billing', icon: Receipt },
  { href: '/cashier/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function CashierLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!auth?.user || !['CASHIER', 'ADMIN'].includes(auth.user.role))) {
      router.push('/login');
    }
  }, [auth, loading, router]);

  if (loading || !auth?.user || !['CASHIER', 'ADMIN'].includes(auth.user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
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
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-100 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="font-display text-lg text-stone-900">Cashier</h1>
              <p className="text-xs text-stone-400">Point of Sale</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <motion.a
                key={item.href}
                href={item.href}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="cashierActiveIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-600"
                  />
                )}
              </motion.a>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-700 font-medium text-sm">
                {auth.user.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{auth.user.name}</p>
              <p className="text-xs text-stone-400">Cashier</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
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