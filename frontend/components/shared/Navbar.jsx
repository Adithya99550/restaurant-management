'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const roleColors = {
  WAITER: 'border-waiter text-waiter',
  KITCHEN: 'border-kitchen text-kitchen',
  CASHIER: 'border-cashier text-cashier',
};

const roleLabels = {
  WAITER: 'Waiter',
  KITCHEN: 'Kitchen',
  CASHIER: 'Cashier',
  ADMIN: 'Admin',
};

export default function Navbar({ title }) {
  const { auth, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card border-b border-border px-6 py-4 flex items-center justify-between"
    >
      <h1 className={`text-2xl font-display font-bold ${roleColors[auth?.user?.role] || 'text-foreground'}`}>
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User size={18} />
          <span className="text-sm">
            {auth?.user?.name} ({roleLabels[auth?.user?.role]})
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </motion.nav>
  );
}