import { useEffect, useMemo, useState } from 'react';
import RightPanel from '../../shared/panels/RightPanel';
import { useSearch } from '../../shared/search/SearchContext';
import { MOCK_MENU } from '@/mocks/mockData';

function Menu() {
  const [items, setItems] = useState(MOCK_MENU);
  const { searchQuery, setSearchQuery } = useSearch();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [discountFilter, setDiscountFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [formValues, setFormValues] = useState({
    name: '',
    price: '',
    category: '',
    ingredients: [{ name: '', amount: '' }],
    imageFile: null,
    imageUrl: '',
    available: true,
    discount: '',
  });

  const openAddPanel = () => {
    setEditingId(null);
    setFormValues({
      name: '',
      price: '',
      category: '',
      ingredients: [{ name: '', amount: '' }],
      imageFile: null,
      imageUrl: '',
      available: true,
      discount: '',
    });
    setIsPanelOpen(true);
  };

  const openEditPanel = (item) => {
    setEditingId(item.id);
    setFormValues({
      name: item.name,
      price: String(item.price),
      category: item.category,
      ingredients:
        item.ingredients && item.ingredients.length
          ? item.ingredients.map((ing) =>
              typeof ing === 'string'
                ? { name: ing, amount: '' }
                : { name: ing.name || '', amount: ing.amount || '' },
            )
          : [{ name: '', amount: '' }],
      imageFile: null,
      imageUrl: item.imageUrl || '',
      available: item.available,
      discount: String(item.discount ?? ''),
    });
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  const handleFieldChange = (event) => {
    const { name, value, checked } = event.target;
    if (name === 'available') {
      setFormValues((prev) => ({ ...prev, available: checked }));
    } else if (name === 'price' || name === 'discount') {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setFormValues((prev) => ({ ...prev, imageFile: null }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormValues((prev) => ({
        ...prev,
        imageFile: file,
        imageUrl: typeof reader.result === 'string' ? reader.result : '',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleIngredientChange = (index, field, value) => {
    setFormValues((prev) => {
      const next = [...prev.ingredients];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, ingredients: next };
    });
  };

  const addIngredientField = () => {
    setFormValues((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '' }],
    }));
  };

  const removeIngredientField = (index) => {
    setFormValues((prev) => {
      const next = prev.ingredients.filter((_, i) => i !== index);
      return {
        ...prev,
        ingredients: next.length ? next : [{ name: '', amount: '' }],
      };
    });
  };

  const handleDelete = () => {
    if (editingId == null) return;
    setItems((prev) => prev.filter((item) => item.id !== editingId));
    setIsPanelOpen(false);
    setToastMessage('Menu item deleted successfully');
    window.setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const price = Number(formValues.price);
    const discount = Number(formValues.discount || 0);
    const cleanIngredients = formValues.ingredients
      .map((ing) => ({
        name: (ing.name || '').trim(),
        amount: (ing.amount || '').trim(),
      }))
      .filter((ing) => ing.name);

    const payload = {
      name: formValues.name,
      price: isNaN(price) ? 0 : price,
      category: formValues.category,
      ingredients: cleanIngredients,
      imageUrl: formValues.imageUrl,
      available: formValues.available,
      discount: isNaN(discount) ? 0 : discount,
    };

    if (editingId != null) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, ...payload } : item
        )
      );
      setToastMessage('Menu item updated successfully');
    } else {
      const nextId =
        items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
      setItems((prev) => [...prev, { id: nextId, ...payload }]);
      setToastMessage('Menu item added successfully');
    }

    setIsPanelOpen(false);

    window.setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  useEffect(
    () => () => {
      setSearchQuery('');
    },
    [setSearchQuery],
  );

  const resetFilters = () => {
    setCategoryFilter('all');
    setAvailabilityFilter('all');
    setDiscountFilter('all');
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
    const q = searchQuery.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    return items.filter((item) => {
      if (q) {
        const ingredientText = (item.ingredients || [])
          .map((ing) => (typeof ing === 'string' ? ing : ing.name))
          .join(' ')
          .toLowerCase();
        const haystack = [item.name, item.category, ingredientText]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      if (availabilityFilter === 'available' && !item.available) {
        return false;
      }
      if (availabilityFilter === 'unavailable' && item.available) {
        return false;
      }

      if (discountFilter === 'with' && !(item.discount > 0)) {
        return false;
      }
      if (discountFilter === 'without' && item.discount > 0) {
        return false;
      }

      if (min != null && item.price < min) return false;
      if (max != null && item.price > max) return false;

      return true;
    });
  }, [
    items,
    searchQuery,
    categoryFilter,
    availabilityFilter,
    discountFilter,
    minPrice,
    maxPrice,
  ]);

  const categories = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.category))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [items],
  );

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Menu
          </h1>
          <p className="text-xs text-slate-500">
            Manage dishes, availability, and discounts.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddPanel}
          className="inline-flex items-center rounded-lg bg-[#C3110C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#a30e09]"
        >
          Add New Menu
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Filters
          </h2>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
          >
            Reset filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
            >
              <option value="all">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">
              Availability
            </label>
            <select
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">
              Discount
            </label>
            <select
              value={discountFilter}
              onChange={(event) => setDiscountFilter(event.target.value)}
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
            >
              <option value="all">All</option>
              <option value="with">With discount</option>
              <option value="without">Without discount</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-600">
              Price range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="Min"
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="Max"
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of menu items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openEditPanel(item)}
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="h-40 w-full overflow-hidden bg-slate-100">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {highlightMatch(item.name, searchQuery)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {highlightMatch(item.category, searchQuery)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    ${item.price.toFixed(2)}
                  </p>
                  {item.discount > 0 && (
                    <p className="text-[11px] text-emerald-600">
                      {item.discount}% off
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    item.available
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* RightPanel for add/update/delete */}
      <RightPanel isOpen={isPanelOpen} onClose={closePanel}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {editingId ? 'Edit menu item' : 'Add menu item'}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Use this form to manage dishes, pricing, and
                availability.
              </p>
            </div>
            {editingId != null && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            )}
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
                onChange={handleFieldChange}
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                  onChange={handleFieldChange}
                  className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="category"
                  className="block text-xs font-medium text-slate-600"
                >
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  required
                  value={formValues.category}
                  onChange={handleFieldChange}
                  className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
                />
              </div>
            </div>

            {/* Ingredients dynamic list */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">
                Ingredients
              </label>
              <div className="space-y-2">
                {formValues.ingredients.map((ingredient, index) => (
                  <div
                    key={`${index}-${ingredient.name}-${ingredient.amount}`}
                    className="grid grid-cols-[1.5fr,1fr,auto] items-center gap-2"
                  >
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(event) =>
                        handleIngredientChange(
                          index,
                          'name',
                          event.target.value,
                        )
                      }
                      placeholder="Ingredient name"
                      className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
                    />
                    <input
                      type="text"
                      value={ingredient.amount}
                      onChange={(event) =>
                        handleIngredientChange(
                          index,
                          'amount',
                          event.target.value,
                        )
                      }
                      placeholder="Amount (e.g. 100g)"
                      className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredientField(index)}
                      className="inline-flex items-center rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIngredientField}
                  className="inline-flex items-center rounded-md border border-dashed border-slate-300 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                >
                  Add ingredient
                </button>
              </div>
            </div>

            {/* Image upload */}
            <div className="space-y-1">
              <label
                htmlFor="image"
                className="block text-xs font-medium text-slate-600"
              >
                Upload image
              </label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-md file:border file:border-slate-200 file:bg-slate-50 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-100"
              />
              {formValues.imageUrl && (
                <div className="mt-2 h-24 w-full overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                  <img
                    src={formValues.imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Availability & discount */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="flex items-center gap-2">
                <input
                  id="available"
                  name="available"
                  type="checkbox"
                  checked={formValues.available}
                  onChange={handleFieldChange}
                  className="h-4 w-4 rounded border-slate-300 text-[#C3110C] focus:ring-[#C3110C]"
                />
                <label
                  htmlFor="available"
                  className="text-xs font-medium text-slate-600"
                >
                  Available
                </label>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="discount"
                  className="block text-xs font-medium text-slate-600"
                >
                  Discount (%)
                </label>
                <input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formValues.discount}
                  onChange={handleFieldChange}
                  className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={closePanel}
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

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toastMessage}
        </div>
      )}
    </section>
  );
}

export default Menu;

