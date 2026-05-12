'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
  const [salesData, setSalesData] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [waiterPerformance, setWaiterPerformance] = useState([]);
  const [tableUtilization, setTableUtilization] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, salesRes, popularRes, waiterRes, tableRes, categoryRes] = await Promise.all([
        api.get(`/analytics/sales-overview?period=${period}`),
        api.get(`/analytics/sales-by-period?period=daily`),
        api.get('/analytics/popular-items'),
        api.get('/analytics/waiter-performance'),
        api.get('/analytics/table-utilization'),
        api.get('/analytics/category-breakdown')
      ]);

      setOverview(overviewRes.data);
      setSalesData(salesRes.data);
      setPopularItems(popularRes.data);
      setWaiterPerformance(waiterRes.data);
      setTableUtilization(tableRes.data);
      setCategoryData(categoryRes.data);
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
    <div className="p-6">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Analytics Dashboard</h1>
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {['today', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend (Last 30 Days)</h3>
                <div className="space-y-2">
                  {salesData.slice(-10).map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20">{item.date.slice(5)}</span>
                      <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-md transition-all duration-500"
                          style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-foreground w-20 text-right">{formatCurrency(item.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                {categoryData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {categoryData.map((cat, index) => {
                      const totalRevenue = categoryData.reduce((sum, c) => sum + c.revenue, 0);
                      const percentage = totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0;
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
                      return (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-foreground">{cat.category}</span>
                            <span className="text-sm text-muted-foreground">{formatCurrency(cat.revenue)} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold mb-4">Popular Items</h3>
                {popularItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {popularItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{item.quantity} sold</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold mb-4">Waiter Performance</h3>
                <div className="space-y-3">
                  {waiterPerformance.map((waiter, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{waiter.name}</p>
                        <p className="text-xs text-muted-foreground">{waiter.totalOrders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(waiter.totalRevenue)}</p>
                        <p className="text-xs text-muted-foreground">Avg: {formatCurrency(waiter.avgOrderValue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
    </div>
  );
}