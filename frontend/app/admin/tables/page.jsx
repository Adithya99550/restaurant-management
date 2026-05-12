'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleDot, X, FileText, CreditCard, Banknote, Smartphone } from 'lucide-react';
import api from '../../../lib/api';

const statusConfig = {
  AVAILABLE: { label: 'Available', color: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ORDERING: { label: 'Ordering', color: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  PREPARING: { label: 'Preparing', color: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  READY: { label: 'Ready', color: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  SERVED: { label: 'Served', color: 'bg-violet-500', bg: 'bg-violet-50', border: 'border-violet-100' },
  BILLING: { label: 'Billing', color: 'bg-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
};

export default function TablesOverview() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingBillId, setPayingBillId] = useState(null);

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

  const fetchOrders = async (tableId) => {
    setLoadingOrders(true);
    try {
      const res = await api.get(`/orders/table/${tableId}`);
      setOrders(res.data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleTableClick = async (table) => {
    setSelectedTable(table);
    await fetchOrders(table.id);
  };

  const handleGenerateBill = async (orderId) => {
    try {
      const res = await api.post(`/bills/generate/${orderId}`);
      if (res.data.success) {
        fetchOrders(selectedTable.id);
        fetchTables();
      }
    } catch (error) {
      console.error('Failed to generate bill:', error);
    }
  };

  const handlePayment = async (method) => {
    try {
      const res = await api.post(`/bills/${payingBillId}/pay`, { method });
      if (res.data.success) {
        setShowPaymentModal(false);
        setPayingBillId(null);
        fetchOrders(selectedTable.id);
        fetchTables();
      }
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  const openPaymentModal = (billId) => {
    setPayingBillId(billId);
    setShowPaymentModal(true);
  };

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'AVAILABLE').length,
    occupied: tables.length - tables.filter(t => t.status === 'AVAILABLE').length,
  };

  const calculateTotal = (orderItems) => {
    return orderItems.reduce((sum, item) => sum + ((item.menuItem?.price || 0) * item.quantity), 0);
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
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((table, index) => {
            const status = statusConfig[table.status] || statusConfig.AVAILABLE;
            const order = table.orders?.[0];
            const billAmount = order?.bill?.totalAmount;
            return (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleTableClick(table)}
                className={`bg-white rounded-2xl p-5 border-2 ${status.border} shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-display font-bold text-stone-900">T{table.number}</h3>
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color.replace('bg-', 'text-')}`}>
                  <CircleDot size={10} />
                  {status.label}
                </div>
                {billAmount && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <p className="text-xs text-stone-400">Bill Amount</p>
                    <p className="text-lg font-bold text-emerald-600">₹{billAmount.toFixed(2)}</p>
                  </div>
                )}
                {order && !billAmount && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <p className="text-xs text-stone-400">Current Order</p>
                    <p className="text-sm font-medium text-stone-700">
                      {order.orderItems?.length || 0} items
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Order Details Panel */}
      <AnimatePresence>
        {selectedTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end"
            onClick={() => setSelectedTable(null)}
          >
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-full max-w-md bg-white h-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-stone-900">Table T{selectedTable.number}</h2>
                    <p className="text-sm text-stone-500">Order Details</p>
                  </div>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <X size={24} className="text-stone-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto h-[calc(100vh-180px)]">
                {loadingOrders ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-center text-stone-500 py-8">No orders for this table</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-stone-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-stone-700">Order #{String(order.id).slice(-6)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="space-y-2 mb-3">
                          {order.orderItems?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-stone-600">{item.quantity}x {item.menuItem?.name || 'Item'}</span>
                              <span className="text-stone-900 font-medium">₹{((item.menuItem?.price || 0) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 border-t border-stone-200">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-stone-900">Total: ₹{calculateTotal(order.orderItems || []).toFixed(2)}</span>
                            {!order.bill ? (
                              <button
                                onClick={() => handleGenerateBill(order.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
                              >
                                <FileText size={16} />
                                Generate Bill
                              </button>
                            ) : !order.bill.paid && (
                              <button
                                onClick={() => openPaymentModal(order.bill.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                              >
                                <CreditCard size={16} />
                                Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Method Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-bold text-stone-900 mb-4">Select Payment Method</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handlePayment('CASH')}
                  className="w-full flex items-center gap-3 p-4 border-2 border-stone-200 rounded-xl hover:border-stone-900 hover:bg-stone-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Banknote size={20} className="text-emerald-600" />
                  </div>
                  <span className="font-medium text-stone-900">Cash</span>
                </button>
                <button
                  onClick={() => handlePayment('UPI')}
                  className="w-full flex items-center gap-3 p-4 border-2 border-stone-200 rounded-xl hover:border-stone-900 hover:bg-stone-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Smartphone size={20} className="text-purple-600" />
                  </div>
                  <span className="font-medium text-stone-900">UPI</span>
                </button>
                <button
                  onClick={() => handlePayment('CARD')}
                  className="w-full flex items-center gap-3 p-4 border-2 border-stone-200 rounded-xl hover:border-stone-900 hover:bg-stone-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard size={20} className="text-blue-600" />
                  </div>
                  <span className="font-medium text-stone-900">Card</span>
                </button>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full mt-4 py-3 text-stone-500 hover:text-stone-700 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}