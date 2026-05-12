'use client';

import { motion } from 'framer-motion';
import TableCard from './TableCard';

const statusColors = {
  AVAILABLE: 'border-cashier/30',
  ORDERING: 'border-waiter animate-glow',
  PREPARING: 'border-orange-500/50 animate-pulse-slow',
  READY: 'border-cashier animate-glow',
  SERVED: 'border-blue-500/30',
  BILLING: 'border-yellow-500/30',
};

export default function TableGrid({ tables, onSelectTable }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {tables.map((table, index) => (
        <motion.div
          key={table.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <TableCard
            table={table}
            borderColor={statusColors[table.status]}
            onClick={() => onSelectTable(table)}
          />
        </motion.div>
      ))}
    </div>
  );
}