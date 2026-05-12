'use client';

import { motion } from 'framer-motion';
import TableCard from './TableCard';

export default function TableGrid({ tables, onSelectTable }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {tables.map((table, index) => (
        <motion.div
          key={table.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
        >
          <TableCard
            table={table}
            onClick={() => onSelectTable(table)}
          />
        </motion.div>
      ))}
    </div>
  );
}