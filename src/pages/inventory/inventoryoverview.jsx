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
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-8">
      {/* Loading State */}
      {isLoading && inventoryItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF4D4F] mb-4"></div>
          <p className="text-slate-500 font-medium">Loading inventory data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Page Header */}
          <div className="pb-6 border-b border-slate-200">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] bg-clip-text text-transparent">
              📦 Inventory Overview
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Real-time inventory stock levels and performance metrics
            </p>
            {matchedCount > 0 && (
              <p className="mt-3 text-sm text-blue-600 font-medium">
                🔍 Found <span className="font-bold">{matchedCount}</span> matching inventory item{matchedCount !== 1 ? 's' : ''}{' '}
                <Link
                  to={`/admin/inventory/list?query=${encodeURIComponent(searchQuery.trim())}`}
                  className="underline hover:text-blue-700 transition-colors"
                >
                  → View List
                </Link>
              </p>
            )}
          </div>

          {/* Summary Cards: 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card
              title="Total Products"
              value={summary.totalProducts}
              icon={Package}
              iconColor="text-blue-600"
              bgColor="from-blue-50 to-blue-100"
              accentColor="from-blue-500 to-blue-600"
            />

            <Card
              title="Top Used Item"
              value={summary.topUsedName}
              icon={TrendingUp}
              iconColor="text-emerald-600"
              bgColor="from-emerald-50 to-emerald-100"
              accentColor="from-emerald-500 to-emerald-600"
            />

            <Card
              title="Low Stock Items"
              value={summary.lowStock}
              icon={AlertTriangle}
              iconColor="text-amber-600"
              bgColor="from-amber-50 to-amber-100"
              accentColor="from-amber-500 to-amber-600"
              highlight={summary.lowStock > 0}
            />

            <Card
              title="Out of Stock"
              value={summary.stockOut}
              icon={XCircle}
              iconColor="text-red-600"
              bgColor="from-red-50 to-red-100"
              accentColor="from-red-500 to-red-600"
              highlight={summary.stockOut > 0}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function Card({ title, value, icon: Icon, iconColor, bgColor, accentColor, highlight }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-7 ${highlight ? 'ring-2 ring-offset-2 ring-yellow-400' : ''}`}>
      {/* Background Gradient */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${accentColor} transition-opacity`}></div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{title}</p>
          <p className={`mt-3 text-3xl font-bold group-hover:text-transparent group-hover:bg-gradient-to-r ${accentColor} group-hover:bg-clip-text transition-all ${
            typeof value === 'number' ? 'text-slate-900' : 'text-slate-700' 
          }`}>
            {value}
          </p>
        </div>

        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${bgColor} flex-shrink-0`}>
          <Icon className={`h-7 w-7 ${iconColor}`} />
        </div>
      </div>

      {/* Subtle Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-white/40 to-transparent pointer-events-none" />
    </div>
  );
}

export default InventoryOverview;