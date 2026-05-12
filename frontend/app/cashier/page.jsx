'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ActiveTables from '../../components/cashier/ActiveTables';
import BillModal from '../../components/cashier/BillModal';
import RevenueCard from '../../components/cashier/RevenueCard';
import api from '../../lib/api';
import useAuth from '../../hooks/useAuth';
import { Bell } from 'lucide-react';

export default function CashierPage() {
  const { auth, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!auth || auth.user.role !== 'CASHIER')) {
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
    if (auth?.user?.role === 'CASHIER') {
      fetchTables();
    }
  }, [auth]);

  useEffect(() => {
    if (typeof window !== 'undefined' && auth?.user?.role === 'CASHIER') {
      const socket = require('../../lib/socket').socket;
      socket.connect();
      socket.emit('join_role', 'cashier');

      socket.on('table_status_update', () => {
        fetchTables();
      });

      socket.on('payment_done', () => {
        fetchTables();
      });

      return () => {
        socket.off('table_status_update');
        socket.off('payment_done');
      };
    }
  }, [auth]);

  const handleSelectTable = async (table) => {
    try {
      const res = await api.get(`/tables/${table.id}`);
      setSelectedTable(res.data.data);
    } catch (error) {
      console.error('Failed to fetch table details:', error);
    }
  };

  const billingTables = tables.filter((t) => t.status === 'BILLING');

  if (authLoading || !auth || auth.user.role !== 'CASHIER') {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display text-stone-900 mb-1">Billing</h2>
        <p className="text-stone-500">Process payments and manage bills</p>
      </div>

      <div className="space-y-6">
        {/* Revenue Card */}
        <RevenueCard />

        {/* Action Required - Billing Tables */}
        {billingTables.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-stone-900">Action Required</h3>
                <p className="text-sm text-stone-500">{billingTables.length} table(s) waiting for payment</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {billingTables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTable(t)}
                  className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  Table {t.number}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Floor Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display text-stone-900">Floor Overview</h3>
            <div className="flex gap-4 text-xs font-medium text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Billing
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            </div>
          ) : (
            <ActiveTables
              tables={tables}
              onSelectTable={handleSelectTable}
            />
          )}
        </div>
      </div>

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