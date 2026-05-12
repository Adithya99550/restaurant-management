'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderQueue from '../../components/kitchen/OrderQueue';
import useAuth from '../../hooks/useAuth';
import { Bell } from 'lucide-react';

export default function KitchenPage() {
  const { auth, loading: authLoading } = useAuth();
  const router = useRouter();
  const [newOrder, setNewOrder] = useState(null);

  useEffect(() => {
    if (!authLoading && (!auth || auth.user.role !== 'KITCHEN')) {
      router.push('/login');
    }
  }, [auth, authLoading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const socket = require('../../lib/socket').socket;
      socket.connect();
      socket.emit('join_role', 'kitchen');

      socket.on('new_order', (order) => {
        setNewOrder(order);
        setTimeout(() => setNewOrder(null), 3000);
      });

      return () => {
        socket.off('new_order');
      };
    }
  }, []);

  if (authLoading || !auth || auth.user.role !== 'KITCHEN') {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display text-stone-900 mb-1">Order Queue</h2>
          <p className="text-stone-500">Manage and prepare orders</p>
        </div>
      </div>

      {/* New Order Notification */}
      <AnimatePresence>
        {newOrder && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50"
          >
            <Bell size={20} />
            <span className="font-medium">New Order - Table {newOrder.table?.number}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <OrderQueue onNewOrder={newOrder} />
    </div>
  );
}