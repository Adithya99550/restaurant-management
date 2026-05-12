'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, CheckCircle } from 'lucide-react';
import { OrderStatusBadge, ItemStatusBadge } from '../shared/StatusBadge';
import api from '../../lib/api';

export default function OrderCard({ order, onUpdate }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startTime = new Date(order.createdAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      setElapsed(Math.floor((now - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPreparing = async () => {
    try {
      await api.patch(`/orders/${order.id}/status`, { status: 'PREPARING' });
      onUpdate();
    } catch (error) {
      console.error('Failed to start preparing:', error);
    }
  };

  const handleMarkReady = async () => {
    try {
      await api.patch(`/orders/${order.id}/status`, { status: 'READY' });
      onUpdate();
    } catch (error) {
      console.error('Failed to mark ready:', error);
    }
  };

  const isPending = order.status === 'PENDING';
  const isPreparing = order.status === 'PREPARING';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-card border border-kitchen/30 rounded-xl p-4"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-display font-bold text-foreground">
            Table {order.table.number}
          </h3>
          <p className="text-muted-foreground text-sm">
            Waiter: {order.waiter.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-muted-foreground" />
          <span className="text-kitchen font-mono font-bold">
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="space-y-2 mb-4">
        {order.orderItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-background rounded-lg p-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-waiter font-bold">{item.quantity}x</span>
              <span className="text-foreground">{item.menuItem.name}</span>
            </div>
            <ItemStatusBadge status={item.status} />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {isPending && (
          <button
            onClick={handleStartPreparing}
            className="flex-1 bg-kitchen text-background py-2 rounded-lg hover:bg-kitchen/90 flex items-center justify-center gap-2"
          >
            <Play size={18} />
            Start Preparing
          </button>
        )}
        {isPreparing && (
          <button
            onClick={handleMarkReady}
            className="flex-1 bg-cashier text-background py-2 rounded-lg hover:bg-cashier/90 flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            Mark Ready
          </button>
        )}
      </div>
    </motion.div>
  );
}