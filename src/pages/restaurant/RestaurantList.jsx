import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "@/pages/login_registration/AuthCard";

import {
  fetchOwnerRestaurants,
  createRestaurant,
} from "@/services/restaurant/restaurantApi";

import {
  Plus,
  AlertCircle,
  Loader2,
  X,
  ImagePlus,
  ChevronRight,
} from "lucide-react";

const RestaurantList = () => {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // scrollable list container reference (used only for styling)
  const listRef = React.useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    location: "",
    contactInfo: "",
    bannerImage: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    loadRestaurants();
  }, []);

  // helper normalizes a restaurant object
  const normalizeRestaurant = (r) => {
    if (!r || typeof r !== 'object') return r;
    const id = r.id || r._id || r.restaurantId || r.restaurant_id || r.restaurant?.id;
    const tenant = r.tenantId || r.tenant_id || r.restaurant?.tenantId;
    return { ...r, id, tenantId: tenant };
  };

  const loadRestaurants = async () => {
    try {
      setIsLoading(true);
      const data = await fetchOwnerRestaurants();
      console.log('[RestaurantList] fetched restaurants raw:', data);
      const normalized = Array.isArray(data)
        ? data.map(normalizeRestaurant)
        : data
        ? normalizeRestaurant(data)
        : [];
      console.log('[RestaurantList] normalized restaurants:', normalized);
      setRestaurants(normalized);
      // update localStorage cache so it matches backend
      try {
        localStorage.setItem('ownedRestaurants', JSON.stringify(normalized));
      } catch {}
      setError(null);
    } catch (err) {
      console.error('loadRestaurants error', err);
      setError("Failed to load restaurants.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRestaurant = (r) => {
  console.log('[RestaurantList] clicked restaurant (normalized):', r);
  // save selected restaurant ID + tenant to localStorage for API headers
  try {
    const id = r?.id;
    console.log('[RestaurantList] id value:', id);
    if (!id) {
      console.error('[RestaurantList] restaurant object missing id', r);
      return;
    }
    localStorage.setItem("restaurantId", id);
    if (r.tenantId) {
      localStorage.setItem('tenantId', r.tenantId);
    }
    // also persist full restaurant object for convenience
    localStorage.setItem('currentRestaurant', JSON.stringify(r));

    // verify immediately
    console.log('[RestaurantList] localStorage after set:', {
      restaurantId: localStorage.getItem('restaurantId'),
      tenantId: localStorage.getItem('tenantId'),
    });

    // update cached ownedRestaurants list so future lookups reflect the last selection
    try {
      const cached = JSON.parse(localStorage.getItem('ownedRestaurants') || '[]');
      const updated = Array.isArray(cached)
        ? cached.map((rest) => (String(rest.id) === String(id) ? r : rest))
        : cached;
      localStorage.setItem('ownedRestaurants', JSON.stringify(updated));
    } catch (err) {
      console.error('[RestaurantList] cache update error', err);
    }
  } catch (e) {
    console.error('[RestaurantList] error storing restaurant', e);
  }

  navigate("/admin", { replace: true });
};



  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setFormData({ ...formData, bannerImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData({ ...formData, bannerImage: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError("Restaurant name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = { ...formData };
      Object.keys(payload).forEach(
        (k) => payload[k] === "" && delete payload[k]
      );

      const newRestaurant = await createRestaurant(payload);
      const normalizedNew = normalizeRestaurant(newRestaurant);
      console.log('[RestaurantList] created restaurant normalized:', normalizedNew);
      setRestaurants((prev) => [...prev, normalizedNew]);

      handleCloseModal();
    } catch {
      setFormError("Failed to create restaurant.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      tagline: "",
      description: "",
      location: "",
      contactInfo: "",
      bannerImage: "",
    });
    setPreviewImage(null);
    setFormError(null);
  };

  /* =========================
     LOADING SCREEN
  ========================== */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  /* =========================
     MAIN RETURN (FULL WIDTH)
  ========================== */
  return (
    <div className="min-h-screen bg-neutral-100 px-6 py-10">
      <div className="w-full max-w-6xl mx-auto">
        <AuthCard
          title="My Restaurants"
          description="Manage your restaurant listings below."
          className="w-full"
        >
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Add Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Restaurant
            </button>
          </div>

          {/* Restaurant List */}
          {restaurants.length === 0 ? (
            <p className="text-center text-gray-500">
              No restaurants found. Add your first restaurant!
            </p>
          ) : (
            <div
              ref={listRef}
              className="space-y-3 h-72 overflow-y-auto pr-1"
            >
              {restaurants.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between bg-white border rounded-lg p-4 hover:shadow-sm transition"
                  >
                  <div className="flex items-center gap-4">
                    <img
                      src={r.bannerImage || "/default-image.png"}
                      alt={r.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-base">{r.name}</h3>
                      {r.tagline && (
                        <p className="text-red-600 text-sm">{r.tagline}</p>
                      )}
                      <p className="text-sm text-gray-400">
                        {r.location || "No address"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewRestaurant(r)}
                      className="p-2 border rounded-lg hover:bg-gray-100"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AuthCard>
      </div>

      {/* MODAL remains EXACTLY SAME as your original */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCloseModal}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 p-6 max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-semibold mb-4">
              Add New Restaurant
            </h2>

            {formError && (
              <p className="text-red-600 mb-4">{formError}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Restaurant Name *"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />

              <input
                type="text"
                name="tagline"
                placeholder="Offer / Tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="text"
                name="contactInfo"
                placeholder="Contact Info"
                value={formData.contactInfo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />

              <div className="border-2 border-dashed p-4 rounded-lg text-center relative">
                {previewImage ? (
                  <>
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-36 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-white p-1 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Click to upload banner
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantList;