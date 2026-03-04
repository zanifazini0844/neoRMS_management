// src/pages/dashboard/Dashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  ShoppingBag,
  Star,
  DollarSign,
  AlertTriangle,
  Users,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import RightPanel from '../../shared/panels/RightPanel';
import { getRestaurantOrders } from '@/services/orderapi';
import { getMenuProductsByRestaurant } from '@/services/menuapi';
import { getStaff as fetchStaffList } from '@/services/staffapi';
import { useInventory } from '../inventory/InventoryContext';

function Dashboard() {
  const role =
    typeof window !== 'undefined' ? window.localStorage.getItem('role') : null;

  const [orders, setOrders] = useState([]);
  // use context inventory instead of local copy
  const { inventoryItems, refreshInventory } = useInventory();
  const [products, setProducts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState(null);

  const formatterCurrency = (value) => {
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value);
    return `৳${formatted}`;
  };

  const formatNumber = (value) =>
    new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(value);

  const extractOrderTotal = (order) => {
    return (
      Number(order.totalPrice) || Number(order.totalAmount) || Number(order.total) || Number(order.grandTotal) || Number(order.amount) || 0
    );
  };

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const [o, prod, st] = await Promise.all([
          getRestaurantOrders(),
          getMenuProductsByRestaurant(),
          fetchStaffList(),
        ]);
        if (!mounted) return;
        setOrders(o || []);
        // inventory comes from context, no setInventory
        setProducts(prod || []);
        setStaff(st || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const deliveredOrders = orders.filter(
      (o) => (o.status || '').toLowerCase() === 'delivered'
    );
    const totalRevenue = deliveredOrders.reduce((acc, o) => acc + extractOrderTotal(o), 0);
    const totalOrders = orders.length;
    // use context inventoryItems
    const stockOut = inventoryItems.filter((i) => i.status === 'out');
    const lowStock = inventoryItems.filter((i) => i.status === 'low');

    return {
      totalRevenue,
      totalOrders,
      totalProducts: products.length,
      lowStock,
      stockOut,
      lowStockCount: lowStock.length,
      stockOutCount: stockOut.length,
      alertCount: lowStock.length + stockOut.length,
      totalStaff: staff.length,
    };
  }, [orders, inventoryItems, products, staff]);

  const cards = [
    {
      key: 'totalRevenue',
      title: 'Total Revenue',
      value: formatNumber(stats.totalRevenue),
      description: 'Click to view delivered orders',
      icon: DollarSign,
      color: 'bg-sky-50 text-sky-700',
      onClick: () => openPanel('revenue'),
    },
    {
      key: 'totalOrders',
      title: 'Total Orders',
      value: (stats.totalOrders || 0).toLocaleString(),
      description: 'Click to view all orders',
      icon: ShoppingBag,
      color: 'bg-emerald-50 text-emerald-700',
      onClick: () => openPanel('orders'),
    },
    {
      key: 'totalProducts',
      title: 'Total Products',
      value: (stats.totalProducts || 0).toString(),
      description: 'Click to view products',
      icon: Star,
      color: 'bg-indigo-50 text-indigo-700',
      onClick: () => openPanel('products'),
    },
    {
      key: 'totalStaff',
      title: 'Total Staff',
      value: (stats.totalStaff || 0).toString(),
      description: 'Click to view staff list',
      icon: Users,
      color: 'bg-slate-50 text-slate-700',
      onClick: () => openPanel('staff'),
    },
  ];

  const allCards = cards;

  function openPanel(type) {
    // always refresh before showing a filtered list
    if (type === 'lowStock' || type === 'stockOut') {
      refreshInventory();
    }
    setPanelType(type);
    setIsPanelOpen(true);
  }

  function closePanel() {
    setIsPanelOpen(false);
    setPanelType(null);
  }

  // Create a tiny revenue-by-month sparkline from delivered orders only
  const revenueByMonth = useMemo(() => {
    const map = new Map();
    const deliveredOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'delivered');
    deliveredOrders.forEach((o) => {
      const d = o.createdAt ? new Date(o.createdAt) : new Date();
      const key = `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}`;
      map.set(key, (map.get(key) || 0) + extractOrderTotal(o));
    });
    const entries = Array.from(map.entries()).sort();
    return entries.map(([, val]) => val);
  }, [orders]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
          Restaurant Dashboard
        </h1>
        <p className="text-slate-500 text-lg">Welcome back! Here's your inventory alert overview.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="space-y-4 text-center">
            <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-r-[#FF4D4F]" />
            <p className="text-slate-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {allCards.map((card) => {
              const Icon = card.icon;
              const gradientMap = {
                'totalRevenue': 'from-blue-600 to-blue-400',
                'totalOrders': 'from-emerald-600 to-emerald-400',
                'totalProducts': 'from-indigo-600 to-indigo-400',
                'lowStock': 'from-amber-600 to-amber-400',
                'stockOut': 'from-red-600 to-red-400',
                'totalStaff': 'from-purple-600 to-purple-400',
              };
              
              return (
                <button
                  key={card.key}
                  onClick={card.onClick}
                  type="button"
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-slate-200/50"
                >
                  {/* Gradient background effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientMap[card.key]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative space-y-3">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientMap[card.key]} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Title */}
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {card.title}
                    </p>

                    {/* Value */}
                    <p className="text-3xl font-bold text-slate-900">
                      {card.value}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center gap-1 pt-1">
                      <p className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
                        Click to view details
                      </p>
                      <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Revenue Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue Trend</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-bold text-slate-900">
                        {formatterCurrency(stats.totalRevenue)}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">This month's revenue</p>
                    </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-48 bg-gradient-to-b from-slate-50 to-transparent rounded-2xl p-4 flex items-end justify-between gap-2">
                  {revenueByMonth.length > 0 ? (
                    <RevenueChart data={revenueByMonth} />
                  ) : (
                    <div className="w-full flex items-center justify-center text-slate-400">
                      No data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => openPanel('lowStock')}
                  className="cursor-pointer rounded-3xl p-4 bg-amber-50 border border-amber-200/50 shadow hover:shadow-md transition flex flex-col items-center justify-center"
                >
                  <AlertTriangle className="h-6 w-6 text-amber-600 mb-2" />
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                    Low stock
                  </p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">
                    {stats.lowStockCount}
                  </p>
                </div>
                <div
                  onClick={() => openPanel('stockOut')}
                  className="cursor-pointer rounded-3xl p-4 bg-red-50 border border-red-200/50 shadow hover:shadow-md transition flex flex-col items-center justify-center"
                >
                  <AlertTriangle className="h-6 w-6 text-red-600 mb-2" />
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                    Out of stock
                  </p>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    {stats.stockOutCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


          </div>
        </>
      )}

      <RightPanel isOpen={isPanelOpen} onClose={closePanel}>
        <PanelContent
          type={panelType}
          orders={orders}
          products={products}
          inventory={inventoryItems}
          staff={staff}
        />
      </RightPanel>
    </section>
  );
}

function RevenueChart({ data = [] }) {
  if (!data || data.length === 0) {
    return null;
  }

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  return (
    <div className="w-full flex items-end justify-between gap-1.5 h-48 px-2">
      {data.map((value, index) => {
        const heightPercent = ((value - min) / range) * 100;
        const isPositive = value > 0;
        
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg shadow-md hover:from-blue-600 hover:to-blue-500 transition-all duration-200 transform hover:scale-105"
              style={{
                height: `${Math.max(heightPercent, 5)}%`,
                minHeight: '8px',
              }}
            />
            <span className="text-xs text-slate-400 font-medium">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index] || `M${index + 1}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Sparkline({ data = [] }) {
  if (!data || data.length === 0) {
    return <div className="text-xs text-slate-400">No data</div>;
  }
  const max = Math.max(...data);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = max === 0 ? 50 : 100 - (v / max) * 100;
    return `${x},${y}`;
  });
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <polyline
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="2"
        points={points.join(' ')}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PanelContent({ type, orders = [], products = [], inventory = [], staff = [] }) {
  if (!type) return <div className="text-sm text-slate-500">No details</div>;

  if (type === 'revenue') {
    const delivered = orders.filter((o) => (o.status || '').toLowerCase() === 'delivered');
    return (
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Delivered Orders</h3>
        {delivered.length === 0 && <p className="text-xs text-slate-500">No delivered orders</p>}
        <ul className="space-y-3">
          {delivered.map((o) => (
            <li key={o.id || o._id} className="rounded-md border p-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Order #{o.reference || o.id || o._id}</div>
                <div className="text-sm text-slate-700">{formatterCurrencyLocal(extractTotalFromOrder(o))}</div>
              </div>
              <div className="text-xs text-slate-500">{new Date(o.createdAt || o.createdAtDate || Date.now()).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (type === 'orders') {
    return (
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Orders</h3>
        {orders.length === 0 && <p className="text-xs text-slate-500">No orders</p>}
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id || o._id} className="rounded-md border p-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Order #{o.reference || o.id || o._id}</div>
                <div className="text-sm text-slate-700">{formatterCurrencyLocal(extractTotalFromOrder(o))}</div>
              </div>
              <div className="text-xs text-slate-500">Status: {o.status || '—'}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (type === 'products') {
    return (
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Products</h3>
        {products.length === 0 && <p className="text-xs text-slate-500">No products</p>}
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id || p._id} className="rounded-md border p-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{p.productTitle || p.name}</div>
                <div className="text-sm text-slate-700">৳{formatPrice(p)}</div>
              </div>
              <div className="text-xs text-slate-500">{p.category || ''}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (type === 'lowStock' || type === 'stockOut') {
    const list = inventory.filter((i) =>
      type === 'stockOut'
        ? Number(i.quantity) === 0
        : Number(i.quantity) > 0 &&
          Number(i.quantity) < Number(i.threshold || i.thresholdQuantity || 0)
    );
    const title = type === 'stockOut' ? 'Out of Stock Products' : 'Low Stock Products';
    return (
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
        {list.length === 0 && <p className="text-xs text-slate-500">No products to show</p>}
        <ul className="space-y-2">
          {list.map((it) => (
            <li
              key={it.id || it._id}
              className="flex justify-between rounded-md bg-slate-50 px-3 py-2"
            >
              <span className="text-sm font-medium truncate">
                {it.name || it.ingredientName || 'Item'}
              </span>
              <span className="text-sm font-semibold">
                {it.quantity}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (type === 'inventoryAlerts') {
    const stockOut = inventory.filter((i) => Number(i.availableQuantity) === 0);
    const low = inventory.filter((i) => {
      const qty = Number(i.availableQuantity);
      const thresh = Number(i.thresholdQuantity || 0);
      return qty > 0 && qty < thresh;
    });
    return (
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Inventory Alerts</h3>
        {(low.length === 0 && stockOut.length === 0) && (
          <p className="text-xs text-slate-500">No items below threshold or out of stock</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* low stock column */}
          {low.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase">Low Stock</p>
              <ul className="mt-2 space-y-1">
                {low.map((it) => (
                  <li key={it.id || it._id} className="flex justify-between rounded-md bg-amber-50 px-3 py-2">
                    <span className="text-sm font-medium text-amber-900 truncate">{it.name || it.ingredientName || 'Item'}</span>
                    <span className="text-xs text-amber-700">{it.availableQuantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* out of stock column */}
          {stockOut.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase">Out of Stock</p>
              <ul className="mt-2 space-y-1">
                {stockOut.map((it) => (
                  <li key={it.id || it._id} className="flex justify-between rounded-md bg-red-50 px-3 py-2">
                    <span className="text-sm font-medium text-red-900 truncate">{it.name || it.ingredientName || 'Item'}</span>
                    <span className="text-xs text-red-700">0</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'staff') {
    return (
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Staff</h3>
        {staff.length === 0 && <p className="text-xs text-slate-500">No staff</p>}
        <ul className="space-y-3">
          {staff.map((s) => (
            <li key={s.id || s._id} className="rounded-md border p-2">
              <div className="text-sm font-medium">{s.fullName || s.name}</div>
              <div className="text-xs text-slate-500">{s.email || s.phone || ''} • {s.role || ''}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <div className="text-sm text-slate-500">Unsupported panel</div>;
}

function extractTotalFromOrder(o) {
  return Number(o.totalPrice) || Number(o.totalAmount) || Number(o.total) || Number(o.grandTotal) || Number(o.amount) || 0;
}

function formatterCurrencyLocal(value) {
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value || 0);
  return `৳${formatted}`;
}

function formatPrice(p) {
  // product price may be in variants
  if (!p) return '0';
  if (p.variants && p.variants.length > 0) return Number(p.variants[0].price || 0).toFixed(2);
  return Number(p.price || p.basePrice || 0).toFixed(2);
}

export default Dashboard;