'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ActiveTables from '../../components/cashier/ActiveTables';
import BillModal from '../../components/cashier/BillModal';
import RevenueCard from '../../components/cashier/RevenueCard';
import api from '../../lib/api';
import useAuth from '../../hooks/useAuth';

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
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      <h1 className="text-2xl font-display font-bold text-foreground">Cashier Dashboard</h1>
      <RevenueCard />

        {billingTables.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-yellow-500 font-display font-bold text-lg mb-1">
                Action Required
              </h3>
              <p className="text-muted-foreground text-sm">
                The following tables have requested their final bill.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {billingTables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTable(t)}
                  className="bg-yellow-500 text-background px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 active:scale-95 transition-all"
                >
                  Table {t.number}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-black text-foreground">
              Floor Overview
            </h2>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cashier" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-waiter" /> Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500" /> Billing
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-cashier/20 border-t-cashier rounded-full animate-spin" />
              <p className="text-muted-foreground font-medium">Synchronizing floor data...</p>
            </div>
          ) : (
            <ActiveTables
              tables={tables}
              onSelectTable={handleSelectTable}
            />
          )}
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