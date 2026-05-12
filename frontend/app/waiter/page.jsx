'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TableGrid from '../../components/waiter/TableGrid';
import OrderPanel from '../../components/waiter/OrderPanel';
import api from '../../lib/api';
import useAuth from '../../hooks/useAuth';

const statusConfig = {
  AVAILABLE: { label: 'Available', color: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ORDERING: { label: 'Ordering', color: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  PREPARING: { label: 'Preparing', color: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  READY: { label: 'Ready', color: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  SERVED: { label: 'Served', color: 'bg-violet-500', bg: 'bg-violet-50', border: 'border-violet-100' },
  BILLING: { label: 'Billing', color: 'bg-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
};

export default function WaiterPage() {
  const { auth, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!auth || auth.user.role !== 'WAITER')) {
      router.push('/login');
    }
  }, [auth, authLoading, router]);

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

  useEffect(() => {
    if (auth?.user?.role === 'WAITER') {
      fetchTables();
    }
  }, [auth]);

  const handleSelectTable = (table) => {
    setSelectedTable(table);
  };

  const handleClosePanel = () => {
    setSelectedTable(null);
    fetchTables();
  };

  if (authLoading || !auth || auth.user.role !== 'WAITER') {
    return null;
  }

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'AVAILABLE').length,
    occupied: tables.length - tables.filter(t => t.status === 'AVAILABLE').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display text-stone-900 mb-2">Tables</h1>
        <p className="text-stone-500">Restaurant floor overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm"
        >
          <p className="text-sm font-medium text-stone-500 mb-1">Total Tables</p>
          <p className="text-3xl font-display text-stone-900">{stats.total}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm"
        >
          <p className="text-sm font-medium text-stone-500 mb-1">Available</p>
          <p className="text-3xl font-display text-emerald-600">{stats.available}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm"
        >
          <p className="text-sm font-medium text-stone-500 mb-1">Occupied</p>
          <p className="text-3xl font-display text-amber-600">{stats.occupied}</p>
        </motion.div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : (
        <TableGrid
          tables={tables}
          onSelectTable={handleSelectTable}
        />
      )}

      <AnimatePresence>
        {selectedTable && (
          <OrderPanel
            table={selectedTable}
            onClose={handleClosePanel}
            onUpdate={fetchTables}
          />
        )}
      </AnimatePresence>
    </div>
  );
}