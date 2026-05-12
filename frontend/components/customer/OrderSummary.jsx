'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';
import { OrderStatusBadge } from '../shared/StatusBadge';

export default function OrderSummary({ order, tableNumber }) {
  if (!order) return null;

  const totalAmount = order.orderItems?.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  ) || 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-display font-bold text-foreground">
          Your Order
        </h3>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="space-y-2 mb-4">
        {order.orderItems?.map((item) => (
          <div
            key={item.id}
            className="flex justify-between text-sm"
          >
            <span className="text-muted-foreground">
              {item.quantity}x {item.menuItem.name}
            </span>
            <span className="text-foreground">
              ₹{(item.menuItem.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-3 border-t border-border font-bold">
        <span className="text-foreground">Total</span>
        <span className="text-customer">₹{totalAmount.toFixed(2)}</span>
      </div>

      {order.status === 'PENDING' && (
        <div className="mt-4 flex items-center gap-2 text-muted-foreground">
          <Clock size={16} />
          <span className="text-sm">Waiting for kitchen to confirm...</span>
        </div>
      )}

      {order.status === 'PREPARING' && (
        <div className="mt-4 flex items-center gap-2 text-waiter">
          <div className="animate-pulse">
            <Clock size={16} />
          </div>
          <span className="text-sm">Your food is being prepared...</span>
        </div>
      )}

      {order.status === 'READY' && (
        <div className="mt-4 flex items-center gap-2 text-cashier">
          <CheckCircle size={16} />
          <span className="text-sm">Your food is ready!</span>
        </div>
      )}
    </div>
  );
}