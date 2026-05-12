'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, LayoutGrid, ChefHat, User, LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function KitchenLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!auth?.user || auth.user.role !== 'KITCHEN')) {
      router.push('/login');
    }
  }, [auth, loading, router]);

  if (loading || !auth?.user || auth.user.role !== 'KITCHEN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
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
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-100 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="font-display text-lg text-stone-900">Kitchen</h1>
              <p className="text-xs text-stone-400">Order Queue</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-stone-100">
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">
              Active Orders
            </p>
            <p className="text-2xl font-display text-emerald-700">--</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex-1 p-4 space-y-2">
          <a
            href="/kitchen"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === '/kitchen'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-500 hover:bg-stone-50'
            }`}
          >
            <LayoutGrid size={20} />
            <span className="font-medium">Orders</span>
          </a>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-3 mb-3 px-4">
            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 font-medium text-sm">
                {auth.user.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{auth.user.name}</p>
              <p className="text-xs text-stone-400">Kitchen Staff</p>
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