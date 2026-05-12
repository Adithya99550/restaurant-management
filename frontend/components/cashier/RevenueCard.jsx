'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart } from 'lucide-react';
import api from '../../lib/api';

export default function RevenueCard() {
  const [revenue, setRevenue] = useState({ totalRevenue: 0, orderCount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    try {
      const res = await api.get('/bills/revenue/today');
      setRevenue(res.data.data);
    } catch (error) {
      console.error('Failed to fetch revenue:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
    const interval = setInterval(fetchRevenue, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="bg-cashier/5 border-b border-cashier/10 p-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-cashier">
          Financial Performance Today
        </h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex items-center gap-4 bg-background/50 p-4 rounded-xl border border-border/50">
          <div className="p-3 bg-cashier/10 rounded-lg text-cashier">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Gross Revenue
            </p>
            <p className="text-3xl font-display font-black text-foreground">
              ₹{revenue.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-background/50 p-4 rounded-xl border border-border/50">
          <div className="p-3 bg-waiter/10 rounded-lg text-waiter">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Closed Orders
            </p>
            <p className="text-3xl font-display font-black text-foreground">
              {revenue.orderCount}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}