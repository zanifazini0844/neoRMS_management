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

  const formatterCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Analytics overview
          </h1>
          <p className="text-xs text-slate-500">
            High-level performance metrics for your restaurant group.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Total revenue
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatterCurrency(SUMMARY.totalRevenue)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600">
            +12.4% vs last period
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Profit
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatterCurrency(SUMMARY.profit)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600">
            Margin {(SUMMARY.profit / SUMMARY.totalRevenue * 100).toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Maintenance cost
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatterCurrency(SUMMARY.maintenance)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Facilities, equipment, recurring services
          </p>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue line chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Monthly revenue
            </h2>
            <span className="text-[11px] text-slate-500">
              Last 12 months
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <YAxis
                  tickFormatter={(v) => `${v / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <Tooltip
                  formatter={(value) => formatterCurrency(value)}
                  labelStyle={{ fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C3110C"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue distribution pie chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Revenue distribution
            </h2>
            <span className="text-[11px] text-slate-500">
              Revenue vs cost vs profit
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REVENUE_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) =>
                    `${entry.name} ${(
                      (entry.value /
                        REVENUE_DISTRIBUTION.reduce(
                          (sum, item) => sum + item.value,
                          0
                        )) *
                      100
                    ).toFixed(0)}%`
                  }
                >
                  {REVENUE_DISTRIBUTION.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatterCurrency(value)}
                  labelStyle={{ fontSize: 12 }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top selling products bar chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Top selling products
            </h2>
            <span className="text-[11px] text-slate-500">
              Based on order count
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_PRODUCTS}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip labelStyle={{ fontSize: 12 }} />
                <Bar dataKey="sales" fill="#E6501B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best selling days area chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Best selling days
            </h2>
            <span className="text-[11px] text-slate-500">
              Weekly revenue trend
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={BEST_DAYS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => formatterCurrency(value)}
                  labelStyle={{ fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C3110C"
                  fill="#fee2e2"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Owner-only high grossing branch bar chart */}
        {role === 'owner' && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">
                High grossing branches
              </h2>
              <span className="text-[11px] text-slate-500">
                Owner overview of branch performance
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BRANCH_REVENUE}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="branch"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatterCurrency(value)}
                    labelStyle={{ fontSize: 12 }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#C3110C"
                    radius={[4, 4, 0, 0]}
                  />
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

