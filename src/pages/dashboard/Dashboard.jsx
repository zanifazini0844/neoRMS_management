// src/pages/dashboard/Dashboard.jsx
import {
  ShoppingBag,
  Clock,
  Star,
  DollarSign,
  AlertTriangle,
  Users,
  Building2,
} from 'lucide-react';

const MOCK_STATS = {
  totalOrders: 1284,
  pendingOrders: 37,
  topSellingItem: 'Margherita Pizza',
  totalRevenue: 452300,
  lowStockItems: 8,
  totalStaff: 32,
  totalRestaurants: 4,
  highGrossingBranch: 'Downtown Branch',
};

function Dashboard() {
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

  const cards = [
    {
      key: 'totalOrders',
      title: 'Total Orders',
      value: MOCK_STATS.totalOrders.toLocaleString(),
      description: 'All orders processed this month',
      icon: ShoppingBag,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      key: 'pendingOrders',
      title: 'Pending Orders',
      value: MOCK_STATS.pendingOrders.toString(),
      description: 'Waiting to be prepared or served',
      icon: Clock,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      key: 'topSellingItem',
      title: 'Top Selling Item',
      value: MOCK_STATS.topSellingItem,
      description: 'Highest ordered item this month',
      icon: Star,
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      key: 'totalRevenue',
      title: 'Total Revenue',
      value: formatterCurrency(MOCK_STATS.totalRevenue),
      description: 'Gross revenue for the current period',
      icon: DollarSign,
      color: 'bg-sky-50 text-sky-700',
    },
    {
      key: 'lowStockItems',
      title: 'Low Stock Items',
      value: MOCK_STATS.lowStockItems.toString(),
      description: 'Ingredients below threshold',
      icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-700',
    },
    {
      key: 'totalStaff',
      title: 'Total Staff',
      value: MOCK_STATS.totalStaff.toString(),
      description: 'Active staff members across branches',
      icon: Users,
      color: 'bg-slate-50 text-slate-700',
    },
  ];

  const ownerCards =
    role === 'owner'
      ? [
          {
            key: 'restaurants',
            title: 'Total Restaurants',
            value: MOCK_STATS.totalRestaurants.toString(),
            description: 'Branches in your restaurant group',
            icon: Building2,
            color: 'bg-[#C3110C]/5 text-[#C3110C]',
          },
          {
            key: 'highGrossingBranch',
            title: 'High Grossing Branch',
            value: MOCK_STATS.highGrossingBranch,
            description: 'Top performer by revenue',
            icon: Building2,
            color: 'bg-[#E6501B]/5 text-[#E6501B]',
          },
        ]
      : [];

  const allCards = [...cards, ...ownerCards];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Dashboard overview
        </h1>
        <p className="text-xs text-slate-500">
          Key metrics for your restaurant&apos;s performance today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {allCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-start gap-3"
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium uppercase text-slate-500">
                  {card.title}
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {card.value}
                </p>
                <p className="text-[11px] text-slate-500">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Dashboard;