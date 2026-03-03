import { useMemo } from 'react';
import { useInventory } from './InventoryContext';
import { useSearch } from '../../shared/search/SearchContext';
import { Link } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

function InventoryOverview() {
  const { inventoryItems, isLoading } = useInventory();
  const { searchQuery } = useSearch();

  const matchedCount = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return 0;
    return inventoryItems.filter((item) =>
      (item.name || '').toLowerCase().includes(q)
    ).length;
  }, [inventoryItems, searchQuery]);

  const summary = useMemo(() => {
    const totalProducts = inventoryItems.length;
    const lowStock = inventoryItems.filter(
      (item) => item.status === 'low'
    ).length;
    const stockOut = inventoryItems.filter(
      (item) => item.status === 'out'
    ).length;
    const topUsed = inventoryItems.reduce(
      (top, item) =>
        top == null || item.usedCount > top.usedCount ? item : top,
      null
    );

    return {
      totalProducts,
      lowStock,
      stockOut,
      topUsedName: topUsed ? topUsed.name : '-',
    };
  }, [inventoryItems]);

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-12">
      {/* Loading State */}
      {isLoading && inventoryItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin mb-4">
            <svg
              className="h-12 w-12 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-slate-500">Loading inventory data...</p>
        </div>
      ) : (
        <>
          {/* Page Title */}
          <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900">
          Inventory Overview
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Real-time inventory performance and stock insights
        </p>
        {matchedCount > 0 && (
          <p className="mt-1 text-sm text-blue-600">
            Found {matchedCount} matching inventory item{matchedCount !== 1 ? 's' : ''}{' '}
            <Link
              to={`/admin/inventory/list?query=${encodeURIComponent(
                searchQuery.trim()
              )}`}
              className="underline"
            >
              view list
            </Link>
          </p>
        )}
          </div>

          {/* Summary Cards: 2 rows x 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl">
            <Card
              title="Total Products"
              value={summary.totalProducts}
              icon={Package}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
            />

            <Card
              title="Top Used Ingredient"
              value={summary.topUsedName}
              icon={TrendingUp}
              iconColor="text-emerald-600"
              bgColor="bg-emerald-50"
            />

            <Card
              title="Low Stock"
              value={summary.lowStock}
              icon={AlertTriangle}
              iconColor="text-amber-600"
              bgColor="bg-amber-50"
            />

            <Card
              title="Stock Out"
              value={summary.stockOut}
              icon={XCircle}
              iconColor="text-red-600"
              bgColor="bg-red-50"
            />
          </div>
        </>
      )}
    </section>
  );
}

function Card({ title, value, icon: Icon, iconColor, bgColor }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>

      {/* Subtle Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-white/40 to-transparent pointer-events-none" />
    </div>
  );
}

export default InventoryOverview;