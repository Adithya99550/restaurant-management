'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Navbar from '../../components/shared/Navbar';
import OrderQueue from '../../components/kitchen/OrderQueue';
import useAuth from '../../hooks/useAuth';

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
    <div className="min-h-screen bg-background">
      <Navbar title="Kitchen" />

      {newOrder && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-kitchen text-background px-6 py-3 rounded-lg animate-pulse z-50">
          New Order - Table {newOrder.table?.number}
        </div>
      )}

      <OrderQueue onNewOrder={newOrder} />
    </div>
  );
}