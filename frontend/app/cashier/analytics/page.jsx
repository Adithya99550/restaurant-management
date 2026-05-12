'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function CashierAnalytics() {
  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, salesRes] = await Promise.all([
        api.get(`/analytics/sales-overview?period=${period}`),
        api.get(`/analytics/sales-by-period?period=daily`)
      ]);

      setOverview(overviewRes.data);
      setSalesData(salesRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Cashier Analytics</h1>

      <div className="flex gap-2 mb-6">
        {['today', 'week', 'month'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === p
                ? 'bg-cashier text-background'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cashier"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-xl p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(overview.totalRevenue)}</p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-foreground">{overview.totalOrders}</p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(overview.averageOrderValue)}</p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend (Last 30 Days)</h3>
            <div className="space-y-2">
              {salesData.slice(-10).map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20">{item.date.slice(5)}</span>
                  <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                    <div
                      className="h-full bg-cashier rounded-md transition-all duration-500"
                      style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-foreground w-20 text-right">{formatCurrency(item.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}