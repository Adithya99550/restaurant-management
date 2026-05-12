'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react';
import api from '../../lib/api';

export default function BillModal({ order, table, onClose, onUpdate }) {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);

  const totalAmount = order?.orderItems?.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  ) || 0;

  const handleGenerateBill = async () => {
    setLoading(true);
    try {
      await api.post(`/bills/generate/${order.id}`);
      onUpdate();
    } catch (error) {
      console.error('Failed to generate bill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const billRes = await api.get(`/bills?tableId=${table.id}`);
      const bill = billRes.data.data.find((b) => b.orderId === order.id);
      if (bill) {
        await api.post(`/bills/${bill.id}/pay`, { method: paymentMethod });
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Failed to process payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'CASH', label: 'Cash', icon: Banknote },
    { id: 'CARD', label: 'Card', icon: CreditCard },
    { id: 'UPI', label: 'UPI', icon: Smartphone },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex justify-between items-center">
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">
                Receipt
              </h2>
              <p className="text-xs text-muted-foreground">Table {table.number}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-border text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content - scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2 mb-4">
              {order?.orderItems?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span className="text-foreground">{item.menuItem.name}</span>
                    <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                  </div>
                  <span className="text-foreground font-medium">
                    ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="font-bold text-foreground">Total</span>
              <span className="text-2xl font-bold text-cashier">₹{totalAmount.toFixed(2)}</span>
            </div>

            {order?.status === 'BILLED' && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Payment Method</p>
                <div className="flex gap-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isActive = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex-1 py-2 rounded-lg flex flex-col items-center gap-1 text-xs font-medium border ${
                          isActive
                            ? 'bg-cashier/10 border-cashier text-cashier'
                            : 'bg-background border-border text-muted-foreground'
                        }`}
                      >
                        <Icon size={18} />
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            {order?.status !== 'BILLED' ? (
              <button
                onClick={handleGenerateBill}
                disabled={loading}
                className="w-full bg-yellow-500 text-background font-bold py-3 rounded-xl disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Generate Invoice'}
              </button>
            ) : (
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-cashier text-background font-bold py-3 rounded-xl disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}