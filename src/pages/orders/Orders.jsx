import { useEffect, useMemo, useState } from "react";
import RightPanel from "../../shared/panels/RightPanel";
import { getRestaurantOrders, getOrderStats } from "../../services/orderapi";
import { Package, Clock, Coffee, CheckCircle, Truck, Clipboard, Inbox, AlertTriangle } from 'lucide-react';

const STATUS_STYLES = {
  pending: "bg-[#fff1f0] text-[#cf1322] border border-[#ffa39e]",
  preparing: "bg-[#fff7e6] text-[#d46b08] border border-[#ffd591]",
  ready: "bg-[#f6ffed] text-[#389e0d] border border-[#b7eb8f]",
  delivered: "bg-white text-[#595959] border border-[#f0f0f0]",
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRestaurantOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const summary = useMemo(() => {
    return getOrderStats(orders);
  }, [orders]);

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setIsPanelOpen(true);
  };

  const closePanel = () => setIsPanelOpen(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeColor = (status) => {
    if (!status) return STATUS_STYLES.pending;
    return STATUS_STYLES[status.toLowerCase()] || STATUS_STYLES.delivered;
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] bg-clip-text text-transparent">
          Orders Management
        </h1>
        <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
          <Clipboard className="w-5 h-5" /> Track and manage all incoming customer orders
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Orders", value: summary.total, icon: <Package className="w-8 h-8" />, color: "from-blue-500 to-blue-600" },
          { label: "Pending", value: summary.pending, icon: <Clock className="w-8 h-8" />, color: "from-amber-500 to-amber-600" },
          { label: "Preparing", value: summary.preparing, icon: <Coffee className="w-8 h-8" />, color: "from-orange-500 to-orange-600" },
          { label: "Ready", value: summary.ready, icon: <CheckCircle className="w-8 h-8" />, color: "from-green-500 to-green-600" },
          { label: "Delivered", value: summary.delivered, icon: <Truck className="w-8 h-8" />, color: "from-slate-500 to-slate-600" },
        ].map((stat, i) => (
          <div
            key={i}
            className="group relative rounded-xl bg-white border border-slate-200 shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900 group-hover:text-[#FF4D4F] transition-colors">
                  {stat.value}
                </p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* States */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D4F] mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Loading orders...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-600" />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3"><Inbox className="inline-block w-10 h-10 text-slate-400" /></div>
            <p className="text-slate-600 font-medium">No orders found</p>
            <p className="text-sm text-slate-500 mt-1">Orders will appear here as customers place them</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr
                    key={order.id || order._id}
                    onClick={() => handleRowClick(order)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors duration-150 border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      #{(order.id || order._id || "").slice(0, 6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {order.customerName || order.customer || "Guest"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#FF4D4F]">
                      ৳{(order.totalPrice || order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold ${getStatusBadgeColor(order.status)}`}>
                        {order.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {formatDate(order.createdAt || order.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <RightPanel isOpen={isPanelOpen} onClose={closePanel}>
        {selectedOrder ? (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-1">
                <Clipboard className="w-5 h-5" /> Order Details
              </h3>
              <p className="text-xs text-slate-500 mt-1">Order #{ (selectedOrder.id || selectedOrder._id || "").slice(0, 6).toUpperCase()}</p>
            </div>

            <div className="space-y-5">
              {/* Order ID & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-600 uppercase">Order ID</p>
                  <p className="mt-2 font-mono text-sm font-bold text-slate-900">
                    {(selectedOrder.id || selectedOrder._id || "N/A").slice(0, 12)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-600 uppercase">Status</p>
                  <span className={`mt-2 inline-block px-4 py-1.5 rounded-full text-xs font-bold ${getStatusBadgeColor(selectedOrder.status)}`}>
                    {selectedOrder.status || "Unknown"}
                  </span>
                </div>
              </div>

              {/* Customer & Date */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase mb-2">Customer</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedOrder.customerName || selectedOrder.customer || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase mb-2">Date & Time</p>
                  <p className="text-sm text-slate-600">
                    {formatDate(selectedOrder.createdAt || selectedOrder.date)}
                  </p>
                </div>
              </div>

              {/* Items Section */}
              {selectedOrder.items?.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs font-bold text-slate-600 uppercase mb-4">Items Ordered</p>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {item.name || item.productName || "Item"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Quantity: <span className="font-bold">{item.quantity || item.qty || 0}</span>
                          </p>
                        </div>
                        <p className="font-bold text-[#FF4D4F] text-sm">
                          ৳{(item.price || item.total || 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Price */}
              <div className="bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] rounded-lg p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-wider opacity-90">Total Amount</p>
                <p className="text-3xl font-bold mt-2">
                  ৳{(selectedOrder.totalPrice || selectedOrder.total || 0).toFixed(2)}
                </p>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs font-bold text-slate-600 uppercase mb-2">Special Notes</p>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-900 flex items-start gap-2">
                    <Clipboard className="w-5 h-5 mt-1" /> {selectedOrder.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-5xl mb-4"><Package className="inline-block w-12 h-12 text-slate-400" /></div>
            <p className="text-slate-500 font-medium">Select an order to view details</p>
          </div>
        )}
      </RightPanel>
    </section>
  );
}

export default Orders;