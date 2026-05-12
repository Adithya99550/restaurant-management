'use client';

import { motion } from 'framer-motion';
import { CircleDot } from 'lucide-react';

const statusConfig = {
  AVAILABLE: { label: 'Available', color: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ORDERING: { label: 'Ordering', color: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  PREPARING: { label: 'Preparing', color: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  READY: { label: 'Ready', color: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  SERVED: { label: 'Served', color: 'bg-violet-500', bg: 'bg-violet-50', border: 'border-violet-100' },
  BILLING: { label: 'Billing', color: 'bg-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
};

export default function TableCard({ table, onClick }) {
  const status = statusConfig[table.status] || statusConfig.AVAILABLE;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border-2 ${status.border} shadow-sm cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-display font-bold text-stone-900">T{table.number}</h3>
        <div className={`w-3 h-3 rounded-full ${status.color}`} />
      </div>
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color.replace('bg-', 'text-')}`}>
        <CircleDot size={10} />
        {status.label}
      </div>
      {table.orders?.[0] && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          <p className="text-xs text-stone-400">Current Order</p>
          <p className="text-sm font-medium text-stone-700">
            {table.orders[0].orderItems?.length || 0} items
          </p>
        </div>
      )}
    </motion.div>
  );
}