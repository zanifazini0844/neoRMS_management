import { useState, useEffect } from 'react';
import RightPanel from '../../shared/panels/RightPanel';
import { getTables, createTable, updateTable, deleteTable } from '@/services/tableapi';
import { fetchAndStoreUserRestaurant } from '@/services/staffapi';

function TableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurantNotFound, setRestaurantNotFound] = useState(false);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({
    tableNumber: '',
    capacity: '',
  });

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTables();
      setTables(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[TableManagement] fetchList error', err);
      setError(err?.message || 'Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ensureRestaurant = async () => {
      const restaurantId = localStorage.getItem('restaurantId');
      if (!restaurantId) {
        const fetched = await fetchAndStoreUserRestaurant();
        if (!fetched) {
          setRestaurantNotFound(true);
          setError('No restaurant assigned to this account.');
          return;
        }
      }
      await fetchList();
    };
    ensureRestaurant();
  }, []);

  const handleOpenPanel = () => {
    setEditingId(null);
    setFormValues({ tableNumber: '', capacity: '' });
    setIsPanelOpen(true);
  };
  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleRowClick = (tbl) => {
    setEditingId(tbl.id);
    setFormValues({
      tableNumber: tbl.tableNumber,
      capacity: tbl.capacity || '',
    });
    setIsPanelOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.tableNumber) {
      alert('Table number is required');
      return;
    }
    const payload = {
      tableNumber: Number(formValues.tableNumber),
    };
    if (formValues.capacity) {
      payload.capacity = Number(formValues.capacity);
    }

    try {
      if (editingId) {
        const updated = await updateTable(editingId, payload);
        setTables((prev) =>
          prev.map((t) => (t.id === editingId ? updated : t))
        );
      } else {
        const created = await createTable(payload);
        setTables((prev) => [...prev, created]);
      }
      setIsPanelOpen(false);
    } catch (err) {
      alert(err?.message || 'Failed to save table');
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    try {
      await deleteTable(editingId);
      setTables((prev) => prev.filter((t) => t.id !== editingId));
      setIsPanelOpen(false);
    } catch (err) {
      alert(err?.message || 'Failed to delete table');
    }
  };

  const isReserved = (tbl) => {
    return Array.isArray(tbl.reservations) && tbl.reservations.length > 0;
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-8 space-y-8">
      {restaurantNotFound && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-4">
          <div className="text-2xl">⚠️</div>
          <p className="text-sm font-semibold text-red-800">
            No restaurant assigned to this account. Please contact your administrator.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] bg-clip-text text-transparent">
            🪑 Table Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Create, view and manage restaurant tables
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenPanel}
          className="px-5 py-3 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          ➕ Add Table
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D4F] mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Loading tables...</p>
            </div>
          </div>
        )}
        {error && !loading && (
          <div className="p-6 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}
        {!loading && tables.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🪑</div>
            <p className="text-slate-600 font-medium">No tables found</p>
            <p className="text-sm text-slate-500 mt-1">Add your first table to get started</p>
          </div>
        )}

        {!loading && tables.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Table #</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tables.map((tbl) => (
                  <tr
                    key={tbl.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors duration-150 border-b border-slate-100 last:border-0"
                    onClick={() => handleRowClick(tbl)}
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">{tbl.tableNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{tbl.capacity || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      {isReserved(tbl) ? (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700">
                          🔴 Reserved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700">
                          ✅ Not Reserved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RightPanel isOpen={isPanelOpen} onClose={handleClosePanel}>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              {editingId ? '✏️ Edit Table' : '➕ Add New Table'}
            </h3>
          </div>

          <div className="space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto pr-3">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Table Number *</label>
              <input
                type="number"
                name="tableNumber"
                value={formValues.tableNumber}
                onChange={handleChange}
                placeholder="e.g. 6"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formValues.capacity}
                onChange={handleChange}
                placeholder="Number of seats"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            {editingId && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-3 rounded-xl text-sm font-semibold text-red-600 border border-red-300 hover:bg-red-50 transition-all"
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-3 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              {editingId ? 'Save changes' : 'Create table'}
            </button>
          </div>
        </form>
      </RightPanel>
    </section>
  );
}

export default TableManagement;
