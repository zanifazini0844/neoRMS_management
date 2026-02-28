import { useEffect, useMemo, useState } from 'react';
import RightPanel from '../../shared/panels/RightPanel';
import { useInventory } from '../../pages/inventory/InventoryContext';
import { useSearch } from '../../shared/search/SearchContext';

function Inventory() {
  const { inventoryItems, addItem, updateItem } = useInventory();
  const { searchQuery, setSearchQuery } = useSearch();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    quantity: '',
    price: '',
    threshold: '',
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [nameFilter, setNameFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(
    () => () => {
      setSearchQuery('');
    },
    [setSearchQuery],
  );

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

  const resetFilters = () => {
    setStatusFilter('all');
    setNameFilter('');
    setMinPrice('');
    setMaxPrice('');
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    if (index === -1) return text;
    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);
    return (
      <>
        {before}
        <span className="bg-yellow-100 text-yellow-800">{match}</span>
        {after}
      </>
    );
  };

  const filteredItems = useMemo(() => {
    const qGlobal = searchQuery.trim().toLowerCase();
    const qLocal = nameFilter.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    return inventoryItems.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      const name = item.name.toLowerCase();
      if (qLocal && !name.includes(qLocal)) return false;
      if (qGlobal && !name.includes(qGlobal)) return false;

      if (min != null && item.price < min) return false;
      if (max != null && item.price > max) return false;

      return true;
    });
  }, [
    inventoryItems,
    statusFilter,
    nameFilter,
    searchQuery,
    minPrice,
    maxPrice,
  ]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormValues({
      name: '',
      quantity: '',
      price: '',
      threshold: '',
    });
    setIsPanelOpen(true);
  };

  const handleRowClick = (item) => {
    setEditingId(item.id);
    setFormValues({
      name: item.name,
      quantity: String(item.quantity),
      price: String(item.price),
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const quantity = Number(formValues.quantity);
    const price = Number(formValues.price);
    const threshold = Number(formValues.threshold);

    if (editingId != null) {
      updateItem(editingId, {
        name: formValues.name,
        quantity,
        price,
        threshold,
      });
    } else {
      addItem({
        name: formValues.name,
        quantity,
        price,
        threshold,
      });
    }

    setIsPanelOpen(false);
  };

  return (
    <section className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Total Product
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {summary.totalProducts}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Top Used Ingredient
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {summary.topUsedName}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Low Stock
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {summary.lowStock}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Stock Out
          </p>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            {summary.stockOut}
          </p>
        </div>
      </div>

      {/* Header + Add button */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Inventory items
        </h2>
        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-900">
              {filteredItems.length}
            </span>{' '}
            of {inventoryItems.length}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center rounded-lg bg-[#C3110C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#a30e09]"
          >
            Add / Update
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">
            Filters
          </h3>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
          >
            Reset
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">
              Search by name
            </label>
            <input
              type="text"
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
              placeholder="Type to filter"
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">
              Min price
            </label>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">
              Max price
            </label>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
            />
          </div>
        </div>
      </div>

      {/* Inventory table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-right font-medium">
                  Quantity
                </th>
                <th className="px-4 py-2 text-right font-medium">Price</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item, index) => (
                <tr
                  key={item.id}
                  className={`cursor-pointer hover:bg-slate-50 ${
                    index % 2 === 1 ? 'bg-slate-50/40' : ''
                  }`}
                  onClick={() => handleRowClick(item)}
                >
                  <td className="px-4 py-2 text-slate-900">
                    {highlightMatch(item.name, searchQuery || nameFilter)}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-900">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'low'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status === 'available'
                        ? 'Available'
                        : item.status === 'low'
                        ? 'Low'
                        : 'Stock Out'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Update panel */}
      <RightPanel isOpen={isPanelOpen} onClose={handleClosePanel}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {editingId ? 'Update item' : 'Add item'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Status will be calculated automatically based on quantity
              and threshold.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-xs font-medium text-slate-600"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formValues.name}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="quantity"
                className="block text-xs font-medium text-slate-600"
              >
                Quantity
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                required
                value={formValues.quantity}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="price"
                className="block text-xs font-medium text-slate-600"
              >
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={formValues.price}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="threshold"
                className="block text-xs font-medium text-slate-600"
              >
                Threshold value
              </label>
              <input
                id="threshold"
                name="threshold"
                type="number"
                min="0"
                required
                value={formValues.threshold}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClosePanel}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#C3110C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#a30e09]"
            >
              Save
            </button>
          </div>
        </form>
      </RightPanel>
    </section>
  );
}

export default Inventory;

