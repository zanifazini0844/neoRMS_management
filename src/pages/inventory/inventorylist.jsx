import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RightPanel from '../../shared/panels/RightPanel';
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
    <section className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">
            <strong>Error loading inventory:</strong> {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && inventoryItems.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <svg
              className="h-8 w-8 text-slate-400"
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
          <p className="ml-3 text-slate-500">Loading inventory...</p>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">
          Inventory List
        </h1>

        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-900">
              {filteredItems.length}
            </span>{' '}
            of {inventoryItems.length}
          </p>

          <button
            onClick={handleOpenAdd}
            className="rounded-lg bg-[#C3110C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#a30e09]"
          >
            Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Filters
          </h3>
          <button
            onClick={resetFilters}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>

          <input
            type="text"
            placeholder="Search by name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
          />

        </div>
      </div>

      {/* Table or Empty State */}
      {!isLoading && inventoryItems.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            No inventory items found. Click "Add Item" to create one.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-right">Quantity</th>
                {/* price column removed */}
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-4 py-2">
                    {highlightMatch(
                      item.name,
                      searchQuery || nameFilter
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'low'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            'Are you sure you want to delete this item?'
                          )
                        ) {
                          deleteItem({ id: item.id, restaurantId: item.restaurantId })
                            .catch((err) => {
                              console.error('delete failed', err);
                              window.alert('Failed to delete: ' + err?.message);
                            });
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Add / Update Panel */}
      <RightPanel isOpen={isPanelOpen} onClose={handleClosePanel}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <h3 className="text-sm font-semibold text-slate-900">
            {editingId ? 'Update Item' : 'Add Item'}
          </h3>

          {['name', 'quantity', 'threshold'].map((field) => (
            <input
              key={field}
              name={field}
              type={field === 'name' ? 'text' : 'number'}
              placeholder={field}
              value={formValues[field]}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
            />
          ))}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClosePanel}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-md bg-[#C3110C] px-3 py-1.5 text-xs text-white"
            >
              Save
            </button>
          </div>
        </form>
      </RightPanel>
    </section>
  );
}

export default InventoryList;