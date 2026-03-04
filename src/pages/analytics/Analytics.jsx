import { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// fetch utilities
import { getRestaurantOrders } from '@/services/orderapi';

// placeholder for static data if API isn't available yet
const DEFAULT_MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 32000 },
  { month: 'Feb', revenue: 28000 },
  { month: 'Mar', revenue: 35000 },
  { month: 'Apr', revenue: 39000 },
  { month: 'May', revenue: 42000 },
  { month: 'Jun', revenue: 46000 },
  { month: 'Jul', revenue: 44000 },
  { month: 'Aug', revenue: 48000 },
  { month: 'Sep', revenue: 45000 },
  { month: 'Oct', revenue: 50000 },
  { month: 'Nov', revenue: 52000 },
  { month: 'Dec', revenue: 58000 },
];


function Analytics() {

  const [orders, setOrders] = useState([]);

  // utility to safely grab a numeric total from the order object
  const extractOrderTotal = (order) => {
    return (
      Number(order.totalPrice) ||
      Number(order.totalAmount) ||
      Number(order.total) ||
      Number(order.grandTotal) ||
      Number(order.amount) ||
      0
    );
  };

  // fetch orders on load
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const o = await getRestaurantOrders();
        if (mounted) setOrders(o || []);
      } catch (err) {
        console.error('Analytics fetch orders error:', err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // derive revenue statistics from orders
  const stats = useMemo(() => {
    const delivered = orders.filter(
      (o) => (o.status || '').toLowerCase() === 'delivered'
    );
    const totalRevenue = delivered.reduce(
      (acc, o) => acc + extractOrderTotal(o),
      0
    );
    return {
      totalRevenue,
    };
  }, [orders]);

  // build monthly revenue array suitable for the line chart
  const monthlyRevenue = useMemo(() => {
    if (orders.length === 0) return DEFAULT_MONTHLY_REVENUE;

    const map = new Map();
    orders.forEach((o) => {
      if ((o.status || '').toLowerCase() !== 'delivered') return;
      const d = o.createdAt ? new Date(o.createdAt) : new Date();
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map.set(key, (map.get(key) || 0) + extractOrderTotal(o));
    });
    const entries = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    const result = entries.map(([key, val]) => {
      const [year, monthIndex] = key.split('-');
      const date = new Date(year, monthIndex);
      const monthStr = date.toLocaleString('en-US', { month: 'short' });
      return { month: monthStr, revenue: val };
    });
    // if there are more than 12 months, take the last 12
    return result.slice(-12);
  }, [orders]);

  const formatterCurrency = (value) => {
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value);
    return `৳${formatted}`;
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] bg-clip-text text-transparent">
          📊 Analytics Dashboard
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Real-time performance metrics and business intelligence
        </p>
      </div>

      {/* Summary card for revenue only */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-7 overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-emerald-500 to-emerald-600 transition-opacity"></div>
          <div className="relative">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Revenue</p>
            <p className="mt-3 text-3xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              {formatterCurrency(stats.totalRevenue || 0)}
            </p>
          </div>
        </div>

        {/* Revenue line chart */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              📈 Monthly Revenue
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Last 12 months
            </span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip formatter={(value) => formatterCurrency(value)} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="revenue" stroke="#C3110C" strokeWidth={3} dot={{ r: 4, fill: '#C3110C' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </section>
  );
}

export default Analytics;

