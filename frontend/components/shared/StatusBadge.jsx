'use client';

import { motion } from 'framer-motion';

const tableStatusConfig = {
  AVAILABLE: { label: 'Available', color: 'bg-cashier/20 text-cashier', border: 'border-cashier/30' },
  ORDERING: { label: 'Ordering', color: 'bg-waiter/20 text-waiter', border: 'border-waiter/30' },
  PREPARING: { label: 'Preparing', color: 'bg-orange-500/20 text-orange-500', border: 'border-orange-500/30' },
  READY: { label: 'Ready', color: 'bg-cashier/20 text-cashier', border: 'border-cashier/30' },
  SERVED: { label: 'Served', color: 'bg-blue-500/20 text-blue-500', border: 'border-blue-500/30' },
  BILLING: { label: 'Billing', color: 'bg-yellow-500/20 text-yellow-500', border: 'border-yellow-500/30' },
};

const orderStatusConfig = {
  PENDING: { label: 'Pending', color: 'bg-gray-500/20 text-gray-400', border: 'border-gray-500/30' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-500/20 text-blue-500', border: 'border-blue-500/30' },
  PREPARING: { label: 'Preparing', color: 'bg-orange-500/20 text-orange-500', border: 'border-orange-500/30' },
  READY: { label: 'Ready', color: 'bg-cashier/20 text-cashier', border: 'border-cashier/30' },
  SERVED: { label: 'Served', color: 'bg-blue-500/20 text-blue-500', border: 'border-blue-500/30' },
  BILLED: { label: 'Billed', color: 'bg-yellow-500/20 text-yellow-500', border: 'border-yellow-500/30' },
  PAID: { label: 'Paid', color: 'bg-cashier/20 text-cashier', border: 'border-cashier/30' },
};

const itemStatusConfig = {
  PENDING: { label: 'Pending', color: 'bg-gray-500/20 text-gray-400' },
  PREPARING: { label: 'Preparing', color: 'bg-orange-500/20 text-orange-500' },
  DONE: { label: 'Done', color: 'bg-cashier/20 text-cashier' },
};

export function TableStatusBadge({ status }) {
  const config = tableStatusConfig[status] || tableStatusConfig.AVAILABLE;

  return (
    <motion.span
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color} ${config.border}`}
    >
      {config.label}
    </motion.span>
  );
}

export function OrderStatusBadge({ status }) {
  const config = orderStatusConfig[status] || orderStatusConfig.PENDING;

  return (
    <motion.span
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </motion.span>
  );
}

export function ItemStatusBadge({ status }) {
  const config = itemStatusConfig[status] || itemStatusConfig.PENDING;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}