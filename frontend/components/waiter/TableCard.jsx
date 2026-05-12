'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { TableStatusBadge } from '../shared/StatusBadge';

export default function TableCard({ table, borderColor, onClick }) {
  const activeOrderCount = table.orders?.filter(
    (o) => o.status !== 'PAID'
  ).length || 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        bg-card border-2 ${borderColor} rounded-xl p-4 cursor-pointer
        hover:bg-card/80 transition-colors
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-2xl font-display font-bold text-foreground">
          {table.number}
        </span>
        <TableStatusBadge status={table.status} />
      </div>

      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Users size={14} />
        <span>{activeOrderCount} order(s)</span>
      </div>

      {table.status === 'READY' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-cashier text-sm font-medium"
        >
          Food ready - Serve now!
        </motion.div>
      )}
    </motion.div>
  );
}