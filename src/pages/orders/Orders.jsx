import { useEffect, useMemo, useState } from 'react';
import RightPanel from '../../shared/panels/RightPanel';
import { getRestaurantOrders, getOrderStats } from '../../services/orderapi';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-emerald-100 text-emerald-800',
  delivered: 'bg-slate-100 text-slate-800',
  // Capitalize variants
  Pending: 'bg-amber-100 text-amber-800',
  Preparing: 'bg-blue-100 text-blue-800',
  Ready: 'bg-emerald-100 text-emerald-800',
  Delivered: 'bg-slate-100 text-slate-800',
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRestaurantOrders();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders');
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

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeColor = (status) => {
    if (!status) return STATUS_COLORS.pending;
    const lowerStatus = status.toLowerCase();
    return STATUS_COLORS[lowerStatus] || STATUS_COLORS[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <section className="space-y-6">
      {/* Top summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Total Orders
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {summary.total}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Pending
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {summary.pending}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Preparing
          </p>
          <p className="mt-2 text-2xl font-semibold text-blue-600">
            {summary.preparing}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Ready
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">
            {summary.ready}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Delivered
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-600">
            {summary.delivered}
          </p>
        </div>
      </div>

      {/* Orders table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            All orders
          </h2>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="px-4 py-8 text-center">
            <p className="text-slate-500">Loading orders...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="px-4 py-8 text-center">
            <p className="text-red-500 text-sm">Error: {error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-slate-500">No orders found</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Order ID</th>
                  <th className="px-4 py-2 text-right font-medium">
                    Total Price
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => handleRowClick(order)}
                  >
                    <td className="px-4 py-2 text-slate-900 font-medium">
                      {order.id || order._id || 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-900 font-medium">
                      ৳{(order.totalPrice || order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(
                          order.status
                        )}`}
                      >
                        {order.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-500 text-xs">
                      {formatDate(order.createdAt || order.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right panel with order details (read-only) */}
      <RightPanel isOpen={isPanelOpen} onClose={closePanel}>
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase">
                Order ID
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {selectedOrder.id || selectedOrder._id || 'N/A'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Customer
                </p>
                <p className="text-sm text-slate-900">
                  {selectedOrder.customerName || selectedOrder.customer || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Status
                </p>
                <p className="mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{
                  backgroundColor: selectedOrder.status?.toLowerCase() === 'pending' ? '#fef3c7' : 
                                  selectedOrder.status?.toLowerCase() === 'cooking' ? '#dbeafe' :
                                  selectedOrder.status?.toLowerCase() === 'ready' ? '#d1fae5' : '#f1f5f9',
                  color: selectedOrder.status?.toLowerCase() === 'pending' ? '#92400e' :
                         selectedOrder.status?.toLowerCase() === 'cooking' ? '#1e40af' :
                         selectedOrder.status?.toLowerCase() === 'ready' ? '#047857' : '#334155'
                }}>
                  {selectedOrder.status || 'Unknown'}
                </p>
              </div>
            </div>

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-2">
                  Items
                </p>
                <ul className="space-y-2 text-sm text-slate-700 border-t border-slate-100 pt-2">
                  {selectedOrder.items.map((item, index) => (
                    <li
                      key={`${selectedOrder.id}-${index}`}
                      className="flex justify-between text-xs"
                    >
                      <div>
                        <p className="font-medium">{item.name || item.productName || 'Item'}</p>
                        <p className="text-slate-500">Qty: {item.quantity || item.qty || 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">৳{(item.price || item.total || 0).toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="flex justify-between">
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Total Price
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  ৳{(selectedOrder.totalPrice || selectedOrder.total || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                Date & Time
              </p>
              <p className="text-sm text-slate-700">
                {formatDate(selectedOrder.createdAt || selectedOrder.date)}
              </p>
            </div>

            {selectedOrder.notes && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                  Notes
                </p>
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                  {selectedOrder.notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Select an order to view details.
          </p>
        )}
      </RightPanel>
    </section>
  );
}

export default Orders;

