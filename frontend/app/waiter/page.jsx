'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/shared/Navbar';
import TableGrid from '../../components/waiter/TableGrid';
import OrderPanel from '../../components/waiter/OrderPanel';
import api from '../../lib/api';
import useAuth from '../../hooks/useAuth';
import { getAuth, redirectByRole } from '../../lib/auth';

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar title="Waiter Dashboard" />

      <main className="p-4">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">
          Tables
        </h2>

        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading tables...
          </div>
        ) : (
          <TableGrid
            tables={tables}
            onSelectTable={handleSelectTable}
          />
        )}
      </main>

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