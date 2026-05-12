'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import BillModal from '../../../components/cashier/BillModal';

const statusColors = {
  AVAILABLE: 'bg-green-500/20 text-green-500 border-green-500',
  ORDERING: 'bg-blue-500/20 text-blue-500 border-blue-500',
  PREPARING: 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
  READY: 'bg-orange-500/20 text-orange-500 border-orange-500',
  SERVED: 'bg-purple-500/20 text-purple-500 border-purple-500',
  BILLING: 'bg-red-500/20 text-red-500 border-red-500',
};

const statusLabels = {
  AVAILABLE: 'Available',
  ORDERING: 'Ordering',
  PREPARING: 'Preparing',
  READY: 'Ready',
  SERVED: 'Served',
  BILLING: 'Billing',
};

export default function TablesOverview() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data.data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTable = async (table) => {
    if (table.status === 'AVAILABLE') return;
    try {
      const res = await api.get(`/tables/${table.id}`);
      setSelectedTable(res.data.data);
    } catch (error) {
      console.error('Failed to fetch table details:', error);
    }
  };

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'AVAILABLE').length,
    occupied: tables.length - tables.filter(t => t.status === 'AVAILABLE').length,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Table Overview</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Tables</p>
          <p className="text-3xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="text-3xl font-bold text-green-500">{stats.available}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Occupied</p>
          <p className="text-3xl font-bold text-red-500">{stats.occupied}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map(table => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleSelectTable(table)}
              className={`bg-card border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${statusColors[table.status].replace('text-', 'border-').split(' ')[0]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-foreground">Table {table.number}</h3>
                <span className={`text-xs px-2 py-1 rounded ${statusColors[table.status]}`}>
                  {statusLabels[table.status]}
                </span>
              </div>
              {table.orders?.[0] && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Current Order</p>
                  <p className="text-sm font-medium text-foreground">
                    {table.orders[0].orderItems?.length || 0} items
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Waiter: {table.orders[0].waiter?.name || 'N/A'}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedTable && (
          <BillModal
            order={selectedTable.orders?.[0]}
            table={selectedTable}
            onClose={() => setSelectedTable(null)}
            onUpdate={fetchTables}
          />
        )}
      </AnimatePresence>
    </div>
  );
}