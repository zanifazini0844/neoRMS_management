import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';

const MONTHLY_REVENUE = [
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

const SUMMARY = {
  totalRevenue: 529000,
  profit: 187000,
  maintenance: 62000,
};

const REVENUE_DISTRIBUTION = [
  { name: 'Revenue', value: SUMMARY.totalRevenue },
  { name: 'Cost', value: SUMMARY.totalRevenue - SUMMARY.profit },
  { name: 'Profit', value: SUMMARY.profit },
];

const TOP_PRODUCTS = [
  { name: 'Margherita Pizza', sales: 1520 },
  { name: 'Cheeseburger', sales: 1175 },
  { name: 'Pasta Alfredo', sales: 980 },
  { name: 'Caesar Salad', sales: 870 },
  { name: 'Tiramisu', sales: 640 },
];

const BEST_DAYS = [
  { day: 'Mon', revenue: 3200 },
  { day: 'Tue', revenue: 4100 },
  { day: 'Wed', revenue: 3800 },
  { day: 'Thu', revenue: 4500 },
  { day: 'Fri', revenue: 6200 },
  { day: 'Sat', revenue: 7800 },
  { day: 'Sun', revenue: 5400 },
];

const BRANCH_REVENUE = [
  { branch: 'Downtown', revenue: 220000 },
  { branch: 'Uptown', revenue: 185000 },
  { branch: 'Seaside', revenue: 165000 },
  { branch: 'Airport', revenue: 142000 },
];

const PIE_COLORS = ['#C3110C', '#E6501B', '#10b981'];

function Analytics() {
  const role =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('role')
      : null;

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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-7 overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-emerald-500 to-emerald-600 transition-opacity"></div>
          <div className="relative">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Revenue</p>
            <p className="mt-3 text-3xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              {formatterCurrency(SUMMARY.totalRevenue)}
            </p>
            <p className="mt-2 text-xs text-emerald-600 font-semibold">↗ +12.4% vs last period</p>
          </div>
        </div>

        <div className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-7 overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-blue-500 to-blue-600 transition-opacity"></div>
          <div className="relative">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Profit</p>
            <p className="mt-3 text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {formatterCurrency(SUMMARY.profit)}
            </p>
            <p className="mt-2 text-xs text-blue-600 font-semibold">Margin {(SUMMARY.profit / SUMMARY.totalRevenue * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-7 overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-orange-500 to-orange-600 transition-opacity"></div>
          <div className="relative">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Maintenance Cost</p>
            <p className="mt-3 text-3xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
              {formatterCurrency(SUMMARY.maintenance)}
            </p>
            <p className="mt-2 text-xs text-slate-500 font-semibold">Facilities & Equipment</p>
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <LineChart data={MONTHLY_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip formatter={(value) => formatterCurrency(value)} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="revenue" stroke="#C3110C" strokeWidth={3} dot={{ r: 4, fill: '#C3110C' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue distribution pie chart */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              🎯 Revenue Distribution
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Revenue vs Cost vs Profit
            </span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REVENUE_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => `${entry.name} ${((entry.value / REVENUE_DISTRIBUTION.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%`}
                >
                  {REVENUE_DISTRIBUTION.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatterCurrency(value)} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top selling products bar chart */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              ⭐ Top Selling Products
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Based on order count
            </span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_PRODUCTS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="sales" fill="#E6501B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best selling days area chart */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              📅 Best Selling Days
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Weekly revenue trend
            </span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={BEST_DAYS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(value) => formatterCurrency(value)} />
                <Area type="monotone" dataKey="revenue" stroke="#C3110C" fill="#fee2e2" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Owner-only high grossing branch bar chart */}
        {role === 'owner' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col lg:col-span-2">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                🏢 High Grossing Branches
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Owner overview of branch performance
              </span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BRANCH_REVENUE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="branch" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(value) => formatterCurrency(value)} />
                  <Bar dataKey="revenue" fill="#C3110C" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Analytics;

