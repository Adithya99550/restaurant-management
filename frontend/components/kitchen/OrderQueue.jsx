'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import OrderCard from './OrderCard';
import api from '../../lib/api';

export default function OrderQueue({ onNewOrder }) {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/active');
      const kitchenOrders = res.data.data.filter(
        (order) => order.status !== 'SERVED' && order.status !== 'PAID' && order.status !== 'BILLED'
      );
      setOrders(kitchenOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (onNewOrder) {
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === onNewOrder.id);
        if (exists) return prev;
        return [onNewOrder, ...prev];
      });
    }
  }, [onNewOrder]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-display font-semibold text-foreground mb-4">
        Active Orders ({orders.length})
      </h2>

      {orders.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-4xl mb-4">👨‍🍳</p>
          <p>No active orders</p>
          <p className="text-sm">New orders will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdate={fetchOrders}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}