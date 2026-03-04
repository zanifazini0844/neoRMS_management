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
import { Plus, Search, Tag, DollarSign, Check, X, Pencil, Package } from 'lucide-react';

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
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] bg-clip-text text-transparent">
            Menu Management
          </h1>
          <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
            <Tag className="w-5 h-5 text-slate-400" />
            Organize dishes, manage availability, and set promotions
          </p>
        </div>
        <button
          type="button"
          onClick={openAddPanel}
          className="inline-flex items-center rounded-xl bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] px-5 py-3 text-sm font-semibold text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Dish
        </button>
      </div>

      {/* Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1">
              <Search className="w-5 h-5" /> Filters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Refine your menu items</p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors"
          >
            Reset All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Tag className="w-4 h-4" /> Category
            </label>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Check className="w-4 h-4" /> Availability
            </label>
            <select
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
            >
              <option value="all">All Items</option>
              <option value="available"><Check className="w-4 h-4 inline mr-1" /> Available</option>
              <option value="unavailable"><X className="w-4 h-4 inline mr-1" /> Unavailable</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Tag className="w-4 h-4" /> Discount
            </label>
            <select
              value={discountFilter}
              onChange={(event) => setDiscountFilter(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
            >
              <option value="all">All Discounts</option>
              <option value="with">With Discount</option>
              <option value="without">No Discount</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> Price Range (৳)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="Min"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10"
              />
              <span className="text-slate-400">–</span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="Max"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items Table */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D4F] mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Loading menu items...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {!isLoading && !error && filteredItems.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <div className="text-4xl mb-3"><Package className="inline-block w-10 h-10 text-slate-400" /></div>
          <p className="text-slate-600 font-medium">No menu items found</p>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or add a new dish</p>
        </div>
      )}

      {!isLoading && !error && filteredItems.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Dish Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Cook Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const baseVariant = item.variants && item.variants.length > 0 ? item.variants[0] : { price: 0, discount: 0 };
                  const imageUrl = item.images && item.images.length > 0 ? item.images[0] : item.imageUrl;
                  const isAvailable = item.status === 'AVAILABLE';
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors duration-150 border-b border-slate-100 last:border-0"
                      onClick={() => openEditPanel(item)}
                    >
                      <td className="px-6 py-4">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.productTitle}
                            className="h-12 w-12 object-cover rounded-lg shadow-sm"
                          />
                        ) : (
                          <div className="h-12 w-12 flex items-center justify-center bg-slate-100 text-xs text-slate-400 rounded-lg">
                            —
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {highlightMatch(item.productTitle, searchQuery)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          {highlightMatch(item.category, searchQuery)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-[#FF4D4F]">
                        ৳{baseVariant.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {baseVariant.discount > 0 ? (
                          <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                            -{baseVariant.discount}%
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          isAvailable 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {isAvailable ? <><Check className="w-4 h-4 inline mr-1" />Available</> : <><X className="w-4 h-4 inline mr-1" />Out of Stock</>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {item.estimatedCookingTime ? `${item.estimatedCookingTime}m` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RightPanel for add/update/delete */}
      <RightPanel isOpen={isPanelOpen} onClose={closePanel}>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />} {editingId ? 'Edit Dish' : 'Add New Dish'}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {editingId ? 'Update dish details and pricing' : 'Create a new menu item'}
              </p>
            </div>
            {editingId != null && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 text-xs font-bold text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Delete
              </button>
            )}
          </div>

          <div className="space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto pr-3">
            {/* Product Title */}
            <div className="space-y-2">
              <label htmlFor="productTitle" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Dish Name <span className="text-red-500">*</span>
              </label>
              <input
                id="productTitle"
                name="productTitle"
                type="text"
                required
                value={formValues.productTitle}
                onChange={handleFieldChange}
                placeholder="e.g., Grilled Chicken Burger"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
              />
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <label htmlFor="productDescription" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Description
              </label>
              <textarea
                id="productDescription"
                name="productDescription"
                value={formValues.productDescription}
                onChange={handleFieldChange}
                rows="3"
                placeholder="Describe your dish... (ingredients, flavor profile, etc.)"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 resize-none transition-all"
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formValues.category}
                  onChange={handleFieldChange}
                  placeholder="MAIN_COURSE"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formValues.status}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all cursor-pointer"
                >
                  <option value="AVAILABLE"><Check className="w-4 h-4 inline mr-1" /> Available</option>
                  <option value="OUT_OF_STOCK"><X className="w-4 h-4 inline mr-1" /> Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Cooking Time & Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="estimatedCookingTime" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cook Time (min)
                </label>
                <input
                  id="estimatedCookingTime"
                  name="estimatedCookingTime"
                  type="number"
                  min="0"
                  value={formValues.estimatedCookingTime}
                  onChange={handleFieldChange}
                  placeholder="15"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="priceCurrency" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Currency
                </label>
                <select
                  id="priceCurrency"
                  name="priceCurrency"
                  value={formValues.priceCurrency}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all cursor-pointer"
                >
                  <option value="BDT">BDT (৳)</option>
                </select>
              </div>
            </div>

            {/* Dietary Tags */}
            <div className="space-y-2">
              <label htmlFor="dietaryTags" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Dietary Tags
              </label>
              <input
                id="dietaryTags"
                name="dietaryTags"
                type="text"
                value={Array.isArray(formValues.dietaryTags) ? formValues.dietaryTags.join(', ') : formValues.dietaryTags}
                onChange={handleFieldChange}
                placeholder="HALAL, GLUTEN_FREE, VEGAN (comma-separated)"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
              />
            </div>

            {/* Variants */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Size Variants
              </label>
              <div className="space-y-3">
                {formValues.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-[2fr,2fr,1.5fr,auto] items-end gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase">Size</label>
                      <input
                        type="text"
                        value={variant.type}
                        onChange={(event) => handleVariantChange(index, 'type', event.target.value)}
                        placeholder="Small, Medium..."
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-1 focus:ring-[#FF4D4F]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase">Price (৳)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price || ''}
                        onChange={(event) => handleVariantChange(index, 'price', event.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-1 focus:ring-[#FF4D4F]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase">Discount %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={variant.discount || 0}
                        onChange={(event) => handleVariantChange(index, 'discount', event.target.value)}
                        placeholder="0"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-1 focus:ring-[#FF4D4F]/20"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariantField(index)}
                      className="px-2 py-2 rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVariantField}
                  className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-slate-300 text-slate-600 hover:border-[#FF4D4F] hover:bg-red-50 text-sm font-bold transition-colors"
                >
                  + Add Size
                </button>
              </div>
            </div>

            {/* Addons */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Add-ons (Optional)
              </label>
              <div className="space-y-3">
                {formValues.addons.map((addon, index) => (
                  <div key={index} className="grid grid-cols-[2fr,1.5fr,auto] items-end gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase">Name</label>
                      <input
                        type="text"
                        value={addon.name}
                        onChange={(event) => handleAddonChange(index, 'name', event.target.value)}
                        placeholder="Extra Cheese, Bacon..."
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-1 focus:ring-[#FF4D4F]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase">Price (৳)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={addon.price || ''}
                        onChange={(event) => handleAddonChange(index, 'price', event.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-1 focus:ring-[#FF4D4F]/20"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAddonField(index)}
                      className="px-2 py-2 rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAddonField}
                  className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-slate-300 text-slate-600 hover:border-[#FF4D4F] hover:bg-red-50 text-sm font-bold transition-colors"
                >
                  + Add Add-on
                </button>
              </div>
            </div>

            {/* Image upload */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <label htmlFor="image" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Dish Image
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
                  className="flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#FF4D4F] hover:bg-red-50 transition-all"
                >
                  <span className="text-3xl mb-2">📷</span>
                  <span className="text-sm font-bold text-slate-600">Click to upload image</span>
                  <span className="text-xs text-slate-500 mt-1">or drag and drop</span>
                </label>
              </div>
              {formValues.imageUrl && (
                <div className="mt-4 space-y-2">
                  <div className="h-40 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
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

          <div className="pt-4 flex gap-3 border-t border-slate-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={closePanel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (editingId ? '⏳ Updating...' : '⏳ Creating...') : (editingId ? <><Check className="w-4 h-4 inline mr-1" />Update Dish</> : <><Check className="w-4 h-4 inline mr-1" />Create Dish</>)}
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

