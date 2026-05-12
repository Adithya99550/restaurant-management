'use client';

import { motion } from 'framer-motion';
import { TableStatusBadge } from '../shared/StatusBadge';

export default function ActiveTables({ tables, onSelectTable }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {tables.map((table, index) => (
        <motion.button
          key={table.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          onClick={() => onSelectTable(table)}
          className={`
            relative overflow-hidden bg-card border-2 rounded-xl p-5 text-left
            h-32 flex flex-col justify-between transition-all group
            ${table.status === 'BILLING' 
              ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)] animate-pulse' 
              : 'border-border hover:border-cashier/40'}
          `}
        >
          <div className="flex justify-between items-start">
            <span className="text-2xl font-display font-black text-foreground group-hover:text-cashier transition-colors">
              {table.number < 10 ? `0${table.number}` : table.number}
            </span>
            <div className={`w-2 h-2 rounded-full ${
              table.status === 'AVAILABLE' ? 'bg-cashier' : 
              table.status === 'BILLING' ? 'bg-yellow-500' : 'bg-waiter'
            }`} />
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Status</span>
            <TableStatusBadge status={table.status} />
          </div>

          {/* Subtle background decoration */}
          <div className="absolute -right-2 -top-2 text-4xl font-display font-black opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
            {table.number}
          </div>
        </motion.button>
      ))}
    </div>
  );
}