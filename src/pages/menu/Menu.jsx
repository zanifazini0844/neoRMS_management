import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RightPanel from '../../shared/panels/RightPanel';
import { useSearch } from '../../shared/search/SearchContext';
import {
  createMenuProduct,
  getMenuProductsByRestaurant,
  deleteMenuProduct,
  updateMenuProduct,
  getMenuProductById,
} from '@/services/menuapi';

function Menu() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchQuery, setSearchQuery } = useSearch();
  const location = useLocation();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  
  // local filter state for later
  const [discountFilter, setDiscountFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    productTitle: '',
    productDescription: '',
    estimatedCookingTime: '',
    status: 'AVAILABLE',
    category: 'MAIN_COURSE',
    priceCurrency: 'BDT',
    dietaryTags: [],
    images: [],
    imageFile: null,
    imageUrl: '',
    variants: [{ type: 'MEDIUM', price: '', discount: 0 }],
    addons: [{ name: '', price: '' }],
  });

  // when mounted or location changes, sync query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('query') || '';
    if (q && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [location.search, searchQuery, setSearchQuery]);

  const openAddPanel = () => {
    setEditingId(null);
    setFormValues({
      productTitle: '',
      productDescription: '',
      estimatedCookingTime: '',
      status: 'AVAILABLE',
      category: 'MAIN_COURSE',
      priceCurrency: 'BDT',
      dietaryTags: [],
      images: [],
      imageFile: null,
      imageUrl: '',
      variants: [{ type: 'MEDIUM', price: '', discount: 0 }],
      addons: [{ name: '', price: '' }],
    });
    setIsPanelOpen(true);
  };

  const openEditPanel = async (item) => {
    setEditingId(item.id);
    setIsLoading(true);
    try {
      // attempt to fetch latest details
      const fresh = await getMenuProductById(item.id);
      const source = fresh || item;
      const baseVariant =
        source.variants && source.variants.length > 0
          ? source.variants[0]
          : { type: 'MEDIUM', price: source.price || 0, discount: source.discount || 0 };

      setFormValues({
        productTitle: source.productTitle || source.name || '',
        productDescription: source.productDescription || '',
        estimatedCookingTime: source.estimatedCookingTime || '',
        status: source.status || 'AVAILABLE',
        category: source.category || 'MAIN_COURSE',
        priceCurrency: source.priceCurrency || 'BDT',
        dietaryTags: source.dietaryTags || [],
        images: source.images || [],
        imageFile: null,
        imageUrl:
          source.images && source.images.length > 0
            ? source.images[0]
            : source.imageUrl || '',
        variants: source.variants || [baseVariant],
        addons: source.addons || [{ name: '', price: '' }],
      });
    } catch (err) {
      console.error('Failed to load item details', err);
      // fall back to passed item
      const baseVariant =
        item.variants && item.variants.length > 0
          ? item.variants[0]
          : { type: 'MEDIUM', price: item.price || 0, discount: item.discount || 0 };
      setFormValues({
        productTitle: item.productTitle || item.name || '',
        productDescription: item.productDescription || '',
        estimatedCookingTime: item.estimatedCookingTime || '',
        status: item.status || 'AVAILABLE',
        category: item.category || 'MAIN_COURSE',
        priceCurrency: item.priceCurrency || 'BDT',
        dietaryTags: item.dietaryTags || [],
        images: item.images || [],
        imageFile: null,
        imageUrl:
          item.images && item.images.length > 0
            ? item.images[0]
            : item.imageUrl || '',
        variants: item.variants || [baseVariant],
        addons: item.addons || [{ name: '', price: '' }],
      });
    } finally {
      setIsLoading(false);
      setIsPanelOpen(true);
    }
  };

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    if (name === 'dietaryTags') {
      const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      setFormValues((prev) => ({ ...prev, dietaryTags: tags }));
    } else if (name === 'estimatedCookingTime') {
      setFormValues((prev) => ({ ...prev, [name]: parseInt(value) || '' }));
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

  const handleVariantChange = (index, field, value) => {
    setFormValues((prev) => {
      const next = [...prev.variants];
      next[index] = {
        ...next[index],
        [field]: field === 'price' || field === 'discount' ? Number(value) : value,
      };
      return { ...prev, variants: next };
    });
  };

  const addVariantField = () => {
    setFormValues((prev) => ({
      ...prev,
      variants: [...prev.variants, { type: '', price: 0, discount: 0 }],
    }));
  };

  const removeVariantField = (index) => {
    setFormValues((prev) => {
      const next = prev.variants.filter((_, i) => i !== index);
      return {
        ...prev,
        variants: next.length ? next : [{ type: '', price: 0, discount: 0 }],
      };
    });
  };

  const handleAddonChange = (index, field, value) => {
    setFormValues((prev) => {
      const next = [...prev.addons];
      next[index] = {
        ...next[index],
        [field]: field === 'price' ? Number(value) : value,
      };
      return { ...prev, addons: next };
    });
  };

  const addAddonField = () => {
    setFormValues((prev) => ({
      ...prev,
      addons: [...prev.addons, { name: '', price: 0 }],
    }));
  };

  const removeAddonField = (index) => {
    setFormValues((prev) => {
      const next = prev.addons.filter((_, i) => i !== index);
      return {
        ...prev,
        addons: next.length ? next : [{ name: '', price: 0 }],
      };
    });
  };

  const handleDelete = async () => {
    if (editingId == null) return;
    
    try {
      setIsSubmitting(true);
      await deleteMenuProduct(editingId);
      // refetch the list from server to stay in sync
      const updatedItems = await getMenuProductsByRestaurant();
      setItems(updatedItems);
      setIsPanelOpen(false);
      setToastMessage('Menu item deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      setToastMessage(err.message || 'Failed to delete menu item');
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => {
        setToastMessage('');
      }, 2500);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      // Clean up addons and variants
      const cleanAddons = formValues.addons
        .filter((addon) => addon.name && addon.price > 0)
        .map((addon) => ({
          name: addon.name.trim(),
          price: Number(addon.price),
        }));

      const cleanVariants = formValues.variants
        .filter((variant) => variant.type && variant.price > 0)
        .map((variant) => ({
          type: variant.type.trim(),
          price: Number(variant.price),
          discount: Number(variant.discount || 0),
        }));

      const images = formValues.imageUrl ? [formValues.imageUrl] : [];
      const cleanDietaryTags = Array.isArray(formValues.dietaryTags)
        ? formValues.dietaryTags.filter(tag => tag)
        : formValues.dietaryTags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const payload = {
        productTitle: formValues.productTitle,
        productDescription: formValues.productDescription,
        estimatedCookingTime: Number(formValues.estimatedCookingTime) || 0,
        status: formValues.status,
        priceCurrency: formValues.priceCurrency,
        category: formValues.category,
        dietaryTags: cleanDietaryTags,
        images: images,
        variants: cleanVariants.length ? cleanVariants : [{ type: 'MEDIUM', price: 0, discount: 0 }],
        addons: cleanAddons,
      };

      if (editingId != null) {
        await updateMenuProduct(editingId, payload);
        // Refresh items from API
        const updatedItems = await getMenuProductsByRestaurant();
        setItems(updatedItems);
        setToastMessage('Menu item updated successfully');
      } else {
        const newItem = await createMenuProduct(payload);
        // Refresh items from API
        const updatedItems = await getMenuProductsByRestaurant();
        setItems(updatedItems);
        setToastMessage('Menu item created successfully');
      }

      setIsPanelOpen(false);
    } catch (err) {
      console.error('Submit error:', err);
      setToastMessage(err.message || 'Failed to save menu item');
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => {
        setToastMessage('');
      }, 2500);
    }
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        const menuItems = await getMenuProductsByRestaurant();
        setItems(menuItems);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load menu items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();

    return () => {
      setSearchQuery('');
    };
  }, [setSearchQuery]);

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
        const descriptionText = (item.productDescription || '').toLowerCase();
        const tagsText = (item.dietaryTags || []).join(' ').toLowerCase();
        const haystack = [item.productTitle || '', item.category, descriptionText, tagsText]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      const isAvailable = item.status === 'AVAILABLE';
      if (availabilityFilter === 'available' && !isAvailable) {
        return false;
      }
      if (availabilityFilter === 'unavailable' && isAvailable) {
        return false;
      }

      const baseVariant = item.variants && item.variants.length > 0 ? item.variants[0] : { price: 0, discount: 0 };
      const hasDiscount = baseVariant.discount > 0;
      if (discountFilter === 'with' && !hasDiscount) {
        return false;
      }
      if (discountFilter === 'without' && hasDiscount) {
        return false;
      }

      const itemPrice = baseVariant.price;
      if (min != null && itemPrice < min) return false;
      if (max != null && itemPrice > max) return false;

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
    <section className="space-y-6 bg-white p-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-[#FF4D4F]">
            Menu
          </h1>
          <p className="text-xs text-slate-500">
            Manage dishes, availability, and discounts.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddPanel}
          className="inline-flex items-center rounded-lg bg-gradient-to-r from-[#FF7F7F] to-[#FFB3B3] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          Add New Menu
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[#FF4D4F]">
            Filters
          </h2>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg bg-gradient-to-r from-[#FF7F7F] to-[#FFB3B3] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
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

      {/* Table view of menu items */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <p className="text-sm text-slate-500">Loading menu items...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && filteredItems.length === 0 && (
        <div className="text-center text-sm text-slate-500">
          No menu items found.
        </div>
      )}

      {!isLoading && !error && filteredItems.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#FFECEC] text-[#2C2C2C]">
            <thead className="bg-[#FFEBEB]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Image
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Title
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Category
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Price
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Discount
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Est. Time
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                  Tags
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredItems.map((item) => {
                const baseVariant = item.variants && item.variants.length > 0 ? item.variants[0] : { price: 0, discount: 0 };
                const imageUrl = item.images && item.images.length > 0 ? item.images[0] : item.imageUrl;
                const isAvailable = item.status === 'AVAILABLE';
                return (
                  <tr
                    key={item.id}
                    className="cursor-pointer hover:[background-color:rgba(255,77,79,0.1)]"
                    onClick={() => openEditPanel(item)}
                  >
                    <td className="px-4 py-2">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.productTitle}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center bg-slate-100 text-xs text-slate-400 rounded">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {highlightMatch(item.productTitle, searchQuery)}
                    </td>
                    <td className="px-4 py-2">
                      {highlightMatch(item.category, searchQuery)}
                    </td>
                    <td className="px-4 py-2">৳{baseVariant.price.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      {baseVariant.discount > 0 ? `${baseVariant.discount}%` : '-'}
                    </td>
                    <td className="px-4 py-2">{isAvailable ? 'Available' : 'Unavailable'}</td>
                    <td className="px-4 py-2">
                      {item.estimatedCookingTime || '-'}
                    </td>
                    <td className="px-4 py-2">
                      {(item.dietaryTags || []).join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
                disabled={isSubmitting}
                className="rounded-md border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Product Title */}
            <div className="space-y-1.5">
              <label
                htmlFor="productTitle"
                className="block text-xs font-semibold text-slate-700"
              >
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                id="productTitle"
                name="productTitle"
                type="text"
                required
                value={formValues.productTitle}
                onChange={handleFieldChange}
                placeholder="Enter product name (e.g. Grilled Chicken Burger)"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C3110C] focus:ring-1 focus:ring-[#C3110C] transition-all"
              />
              <p className="text-[10px] text-slate-500">Give your product a clear, descriptive name</p>
            </div>

            {/* Product Description */}
            <div className="space-y-1.5">
              <label
                htmlFor="productDescription"
                className="block text-xs font-semibold text-slate-700"
              >
                Description
              </label>
              <textarea
                id="productDescription"
                name="productDescription"
                value={formValues.productDescription}
                onChange={handleFieldChange}
                rows="3"
                placeholder="Describe your product... (e.g. Juicy grilled chicken patty with fresh lettuce and tomato)"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C3110C] focus:ring-1 focus:ring-[#C3110C] resize-none transition-all"
              />
              <p className="text-[10px] text-slate-500">Help customers understand what they're ordering</p>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="category"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formValues.category}
                  onChange={handleFieldChange}
                  placeholder="e.g. MAIN_COURSE"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C3110C] focus:ring-1 focus:ring-[#C3110C] transition-all"
                />
                <p className="text-[10px] text-slate-500">MAIN_COURSE, DESSERT, etc.</p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="status"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Availability
                </label>
                <select
                  id="status"
                  name="status"
                  value={formValues.status}
                  onChange={handleFieldChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C3110C] focus:ring-1 focus:ring-[#C3110C] transition-all cursor-pointer"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Cooking Time & Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="estimatedCookingTime"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Est. Cooking Time
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="estimatedCookingTime"
                    name="estimatedCookingTime"
                    type="number"
                    min="0"
                    max="120"
                    value={formValues.estimatedCookingTime}
                    onChange={handleFieldChange}
                    placeholder="15"
                    className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C3110C] focus:ring-1 focus:ring-[#C3110C] transition-all"
                  />
                  <span className="text-xs text-slate-600 font-medium">min</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="priceCurrency"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Currency
                </label>
                <select
                  id="priceCurrency"
                  name="priceCurrency"
                  value={formValues.priceCurrency}
                  onChange={handleFieldChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C3110C] focus:ring-1 focus:ring-[#C3110C] transition-all cursor-pointer"
                >
                  <option value="BDT">BDT (৳)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="PKR">PKR (₨)</option>
                </select>
              </div>
            </div>

            {/* Dietary Tags */}
            <div className="space-y-1.5">
              <label
                htmlFor="dietaryTags"
                className="block text-xs font-semibold text-slate-700"
              >
                Dietary Tags
              </label>
              <input
                id="dietaryTags"
                name="dietaryTags"
                type="text"
                value={Array.isArray(formValues.dietaryTags) ? formValues.dietaryTags.join(', ') : formValues.dietaryTags}
                onChange={handleFieldChange}
                placeholder="e.g. HALAL, GLUTEN_FREE, VEGAN"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#C3110C] focus:ring-1 focus:ring-[#C3110C] transition-all"
              />
              <p className="text-[10px] text-slate-500">Separate multiple tags with commas</p>
            </div>

            {/* Variants */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Size Variants
              </label>
              <div className="space-y-2">
                {formValues.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr,1fr,1fr,auto] items-end gap-2 p-3 bg-slate-50 rounded-md border border-slate-200"
                  >
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-1">
                        Size
                      </label>
                      <input
                        type="text"
                        value={variant.type}
                        onChange={(event) =>
                          handleVariantChange(index, 'type', event.target.value)
                        }
                        placeholder="e.g. SMALL, MEDIUM, LARGE"
                        className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:border-[#C3110C] focus:ring-1 focus:ring-[#C3110C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-1">
                        Price (BDT)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price || ''}
                        onChange={(event) =>
                          handleVariantChange(index, 'price', event.target.value)
                        }
                        placeholder="0.00"
                        className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:border-[#C3110C] focus:ring-1 focus:ring-[#C3110C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={variant.discount || 0}
                        onChange={(event) =>
                          handleVariantChange(index, 'discount', event.target.value)
                        }
                        placeholder="0"
                        className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:border-[#C3110C] focus:ring-1 focus:ring-[#C3110C]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariantField(index)}
                      className="px-3 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-medium transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVariantField}
                  className="w-full px-3 py-2 rounded-md border-2 border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  + Add Variant
                </button>
              </div>
            </div>

            {/* Addons */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Add-ons (Optional)
              </label>
              <div className="space-y-2">
                {formValues.addons.map((addon, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1.5fr,1fr,auto] items-end gap-2 p-3 bg-slate-50 rounded-md border border-slate-200"
                  >
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-1">
                        Add-on Name
                      </label>
                      <input
                        type="text"
                        value={addon.name}
                        onChange={(event) =>
                          handleAddonChange(index, 'name', event.target.value)
                        }
                        placeholder="e.g. Extra Cheese, Bacon Strip"
                        className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:border-[#C3110C] focus:ring-1 focus:ring-[#C3110C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-1">
                        Price (BDT)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={addon.price || ''}
                        onChange={(event) =>
                          handleAddonChange(index, 'price', event.target.value)
                        }
                        placeholder="0.00"
                        className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:border-[#C3110C] focus:ring-1 focus:ring-[#C3110C]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAddonField(index)}
                      className="px-3 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-medium transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAddonField}
                  className="w-full px-3 py-2 rounded-md border-2 border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  + Add Add-on
                </button>
              </div>
            </div>

            {/* Image upload */}
            <div className="space-y-1.5">
              <label
                htmlFor="image"
                className="block text-xs font-semibold text-slate-700"
              >
                Product Image
              </label>
              <div className="relative">
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-md cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-600">
                    📷 Click to upload image
                  </span>
                </label>
              </div>
              {formValues.imageUrl && (
                <div className="mt-2 space-y-2">
                  <div className="h-32 w-full overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                    <img
                      src={formValues.imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 text-center">Image preview</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={closePanel}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-[#FF4D4F] text-[#2C2C2C] font-medium text-sm hover:bg-[#FFF5F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF7F7F] to-[#FFB3B3] text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Product' : 'Create Product')}
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

