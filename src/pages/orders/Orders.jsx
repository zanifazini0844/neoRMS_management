import { useMemo, useState } from 'react';
import RightPanel from '../../shared/panels/RightPanel';

const MOCK_ORDERS = [
  {
    id: 'ORD-1001',
    customer: 'John Doe',
    total: 42.5,
    status: 'Pending',
    date: '2026-02-26 12:30',
    items: [
      { name: 'Margherita Pizza', qty: 1 },
      { name: 'Coke', qty: 2 },
    ],
    table: 'T3',
  },
  {
    id: 'ORD-1002',
    customer: 'Sarah Lee',
    total: 67.8,
    status: 'Cooking',
    date: '2026-02-26 12:45',
    items: [
      { name: 'Pasta Alfredo', qty: 2 },
      { name: 'Garlic Bread', qty: 1 },
    ],
    table: 'T1',
  },
  {
    id: 'ORD-1003',
    customer: 'Mike Johnson',
    total: 25.0,
    status: 'Ready',
    date: '2026-02-26 13:05',
    items: [{ name: 'Caesar Salad', qty: 1 }],
    table: 'T5',
  },
  {
    id: 'ORD-1004',
    customer: 'Emma Wilson',
    total: 89.3,
    status: 'Served',
    date: '2026-02-26 13:20',
    items: [
      { name: 'Steak', qty: 2 },
      { name: 'Red Wine', qty: 1 },
    ],
    table: 'T2',
  },
];

const STATUS_COLORS = {
  Pending: 'bg-amber-100 text-amber-800',
  Cooking: 'bg-blue-100 text-blue-800',
  Ready: 'bg-emerald-100 text-emerald-800',
  Served: 'bg-slate-100 text-slate-800',
};

function Orders() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const summary = useMemo(() => {
    return MOCK_ORDERS.reduce(
      (acc, order) => {
        if (order.status === 'Pending') acc.pending += 1;
        if (order.status === 'Cooking') acc.cooking += 1;
        if (order.status === 'Ready') acc.ready += 1;
        if (order.status === 'Served') acc.served += 1;
        return acc;
      },
      { pending: 0, cooking: 0, ready: 0, served: 0 }
    );
  }, []);

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <section className="space-y-6">
      {/* Top summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Pending
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {summary.pending}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Cooking
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {summary.cooking}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Ready
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {summary.ready}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Served
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {summary.served}
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
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">ID</th>
                <th className="px-4 py-2 text-left font-medium">
                  Customer
                </th>
                <th className="px-4 py-2 text-right font-medium">
                  Total
                </th>
                <th className="px-4 py-2 text-left font-medium">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_ORDERS.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => handleRowClick(order)}
                >
                  <td className="px-4 py-2 text-slate-900">
                    {order.id}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {order.customer}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                {selectedOrder.id}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Customer
                </p>
                <p className="text-sm text-slate-900">
                  {selectedOrder.customer}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Table
                </p>
                <p className="text-sm text-slate-900">
                  {selectedOrder.table}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                Items
              </p>
              <ul className="space-y-1 text-sm text-slate-700">
                {selectedOrder.items.map((item, index) => (
                  <li
                    key={`${selectedOrder.id}-${item.name}-${index}`}
                    className="flex justify-between"
                  >
                    <span>{item.name}</span>
                    <span className="text-slate-500">x{item.qty}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Status
                </p>
                <p className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                  {selectedOrder.status}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Status is read-only. Manager/Owner cannot change it
                  from here.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Total
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  ${selectedOrder.total.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                Placed at
              </p>
              <p className="text-sm text-slate-700">
                {selectedOrder.date}
              </p>
            </div>
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

