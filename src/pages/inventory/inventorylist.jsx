import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RightPanel from '../../shared/panels/RightPanel';
import Pagination from '../../shared/Pagination';
import { useInventory } from './InventoryContext';
import { useSearch } from '../../shared/search/SearchContext';
import { Trash2 } from 'lucide-react';

function InventoryList() {
  const { inventoryItems, addItem, updateItem, deleteItem, isLoading, error } =
    useInventory();
  const { searchQuery, setSearchQuery } = useSearch();
  const location = useLocation();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formValues, setFormValues] = useState({
    name: '',
    quantity: '',
    threshold: '',
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [nameFilter, setNameFilter] = useState('');

  // read query param on mount/update so deep links and suggestion clicks work
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('query') || '';
    if (q && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [location.search, searchQuery, setSearchQuery]);

  // Reset filters
  const resetFilters = () => {
    setStatusFilter('all');
    setNameFilter('');
  };

  // Highlight search match
  const highlightMatch = (text, query) => {
    if (!query) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return text;

    return (
      <>
        {text.slice(0, index)}
        <span className="bg-yellow-100 text-yellow-800">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  };

  // Filtering logic
  const filteredItems = useMemo(() => {
    const qGlobal = searchQuery.trim().toLowerCase();
    const qLocal = nameFilter.trim().toLowerCase();

    return inventoryItems.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      const name = item.name.toLowerCase();
      if (qLocal && !name.includes(qLocal)) return false;
      if (qGlobal && !name.includes(qGlobal)) return false;

      return true;
    });
  }, [
    inventoryItems,
    statusFilter,
    nameFilter,
    searchQuery,
  ]);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredItems]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);

  // Open add panel
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormValues({
      name: '',
      quantity: '',
      threshold: '',
    });
    setIsPanelOpen(true);
  };

  // Open edit panel
  const handleRowClick = (item) => {
    setEditingId(item.id);
    setFormValues({
      name: item.name,
      quantity: String(item.quantity),
      threshold: String(item.threshold),
    });
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form values before sending
    if (!formValues.name || formValues.name.trim() === '') {
      window.alert('Please enter a product name.');
      return;
    }

    const quantity = Number(formValues.quantity);
    const threshold = Number(formValues.threshold);

    if (isNaN(quantity) || quantity < 0) {
      window.alert('Quantity must be a valid non-negative number.');
      return;
    }

    if (isNaN(threshold) || threshold < 0) {
      window.alert('Threshold must be a valid non-negative number.');
      return;
    }

    try {
      if (editingId != null) {
        await updateItem(editingId, {
          name: formValues.name,
          quantity,
          threshold,
        });
      } else {
        await addItem({
          name: formValues.name,
          quantity,
          threshold,
        });
      }
      setIsPanelOpen(false);
    } catch (err) {
      console.error('failed to save inventory item', err);
      const errorMsg = err?.message || String(err);
      window.alert('Error: ' + errorMsg);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-8 space-y-8">
      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && inventoryItems.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D4F] mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Loading inventory...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] bg-clip-text text-transparent">
                Inventory Management
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                📊 Track stock levels and manage items
              </p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <p className="text-xs text-slate-500 font-medium">
                {/* range info handled by pagination below table */}
                Showing <span className="font-bold text-slate-900">{filteredItems.length}</span> of <span className="font-bold text-slate-900">{inventoryItems.length}</span>
              </p>
              <button
                onClick={handleOpenAdd}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] text-white text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
              >
                ➕ Add Item
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">🔍 Filters</h3>
                <p className="text-xs text-slate-500 mt-0.5">Refine your inventory items</p>
              </div>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Reset All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
                >
                  <option value="all">All Items</option>
                  <option value="available">✓ Available</option>
                  <option value="low">⚠️ Low Stock</option>
                  <option value="out">✗ Out of Stock</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Search by Name</label>
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10"
                />
              </div>
            </div>
          </div>

          {/* Table or Empty State */}
          {inventoryItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-slate-600 font-medium">No inventory items found</p>
              <p className="text-sm text-slate-500 mt-1">Click "Add Item" to create one</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedItems.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => handleRowClick(item)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors duration-150 border-b border-slate-100 last:border-0"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {highlightMatch(item.name, searchQuery || nameFilter)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-[#FF4D4F]">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold ${
                            item.status === 'available'
                              ? 'bg-green-50 text-green-700'
                              : item.status === 'low'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {item.status === 'available' && '✓'} {item.status === 'low' && '⚠️'} {item.status === 'out' && '✗'} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this item?')) {
                                deleteItem({ id: item.id, restaurantId: item.restaurantId }).catch((err) => {
                                  console.error('delete failed', err);
                                  window.alert('Failed to delete: ' + err?.message);
                                });
                              }
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredItems.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Add / Update Panel */}
      <RightPanel isOpen={isPanelOpen} onClose={handleClosePanel}>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              {editingId ? '✏️ Edit Item' : '➕ Add Item'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {editingId ? 'Update inventory details' : 'Create a new inventory item'}
            </p>
          </div>

          {['name', 'quantity', 'threshold'].map((field) => (
            <div key={field} className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {field === 'name' ? '📦 Item Name' : field === 'quantity' ? '📊 Quantity' : '⚠️ Threshold'}
              </label>
              <input
                name={field}
                type={field === 'name' ? 'text' : 'number'}
                placeholder={`Enter ${field}`}
                value={formValues[field]}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
              />
              <p className="text-[10px] text-slate-500">
                {field === 'threshold' ? 'Alert when quantity falls below this number' : ''}
              </p>
            </div>
          ))}

          <div className="pt-4 flex gap-3 border-t border-slate-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={handleClosePanel}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              ✓ Save Item
            </button>
          </div>
        </form>
      </RightPanel>
    </section>
  );
}

export default InventoryList;