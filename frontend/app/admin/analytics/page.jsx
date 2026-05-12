'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingCart, Clock } from 'lucide-react';
import api from '../../../lib/api';

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
  const [salesData, setSalesData] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [waiterPerformance, setWaiterPerformance] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, salesRes, popularRes, waiterRes, categoryRes] = await Promise.all([
        api.get(`/analytics/sales-overview?period=${period}`),
        api.get(`/analytics/sales-by-period?period=daily`),
        api.get('/analytics/popular-items'),
        api.get('/analytics/waiter-performance'),
        api.get('/analytics/category-breakdown')
      ]);

      setOverview(overviewRes.data);
      setSalesData(salesRes.data);
      setPopularItems(popularRes.data);
      setWaiterPerformance(waiterRes.data);
      setCategoryData(categoryRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1);

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(overview.totalRevenue), icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Orders', value: overview.totalOrders, icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg Order Value', value: formatCurrency(overview.averageOrderValue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display text-stone-900 mb-2">Analytics</h1>
        <p className="text-stone-500">Track your restaurant performance</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-8">
        {['today', 'week', 'month'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              period === p
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-100'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-stone-500">{stat.label}</span>
                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-display text-stone-900">{stat.value}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trend */}
            <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
              <h3 className="font-display text-lg text-stone-900 mb-6">Revenue Trend</h3>
              <div className="space-y-3">
                {salesData.slice(-7).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4"
                  >
                    <span className="text-xs text-stone-400 w-16">{item.date.slice(5)}</span>
                    <div className="flex-1 h-8 bg-stone-50 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full bg-indigo-500 rounded-lg"
                      />
                    </div>
                    <span className="text-sm font-medium text-stone-700 w-20 text-right">
                      {formatCurrency(item.revenue)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
              <h3 className="font-display text-lg text-stone-900 mb-6">Category Breakdown</h3>
              {categoryData.length === 0 ? (
                <p className="text-stone-400 text-center py-8">No data available</p>
              ) : (
                <div className="space-y-4">
                  {categoryData.map((cat, index) => {
                    const totalRevenue = categoryData.reduce((sum, c) => sum + c.revenue, 0);
                    const percentage = totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0;
                    const colors = ['bg-indigo-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500', 'bg-violet-500'];
                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-stone-700">{cat.category}</span>
                          <span className="text-sm text-stone-500">{formatCurrency(cat.revenue)} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`h-full ${colors[index % colors.length]} rounded-full`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Items */}
            <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
              <h3 className="font-display text-lg text-stone-900 mb-6">Popular Items</h3>
              {popularItems.length === 0 ? (
                <p className="text-stone-400 text-center py-8">No data available</p>
              ) : (
                <div className="space-y-4">
                  {popularItems.slice(0, 5).map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-stone-400">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-stone-900">{item.name}</p>
                          <p className="text-xs text-stone-400">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-stone-900">{item.quantity} sold</p>
                        <p className="text-xs text-stone-400">{formatCurrency(item.revenue)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Waiter Performance */}
            <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
              <h3 className="font-display text-lg text-stone-900 mb-6">Waiter Performance</h3>
              {waiterPerformance.length === 0 ? (
                <p className="text-stone-400 text-center py-8">No data available</p>
              ) : (
                <div className="space-y-4">
                  {waiterPerformance.map((waiter, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-stone-900">{waiter.name}</p>
                        <p className="text-xs text-stone-400">{waiter.totalOrders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-stone-900">{formatCurrency(waiter.totalRevenue)}</p>
                        <p className="text-xs text-stone-400">Avg: {formatCurrency(waiter.avgOrderValue)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}