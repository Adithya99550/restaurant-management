'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, X, Plus, Minus, Send } from 'lucide-react';
import api from '../../../lib/api';
import { OrderStatusBadge } from '../../../components/shared/StatusBadge';

export default function WaiterOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/active');
      setOrders(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkServed = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'SERVED' });
      fetchOrders();
    } catch (error) {
      console.error('Failed to mark served:', error);
    }
  };

  const myOrders = orders.filter(o => o.waiterId === 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display text-stone-900">My Orders</h1>
        <p className="text-stone-500">Track orders assigned to you</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : myOrders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-stone-400" />
          </div>
          <p className="text-stone-500">No active orders</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg text-stone-900">Table {order.table.number}</h3>
                  <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="space-y-2 mb-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-stone-600">{item.menuItem.name}</span>
                    <span className="font-medium text-stone-900">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              {order.status === 'READY' && (
                <button
                  onClick={() => handleMarkServed(order.id)}
                  className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
                >
                  Mark as Served
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClipboardList({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
    </svg>
  );
}