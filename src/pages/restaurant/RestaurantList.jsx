import React, { useState, useEffect } from 'react';
import { fetchOwnerRestaurants, createRestaurant } from '@/services/restaurant/restaurantApi';
import { Plus, AlertCircle, Loader2, X, ImagePlus } from 'lucide-react';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    location: '',
    contactInfo: '',
    bannerImage: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setIsLoading(true);
      const data = await fetchOwnerRestaurants();
      setRestaurants(data);
      setError(null);
    } catch {
      setError("Failed to load restaurants.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setFormError("Image must be <2MB");

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setFormData({ ...formData, bannerImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData({ ...formData, bannerImage: '' });
    const fileInput = document.getElementById('bannerImage');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setFormError("Restaurant name is required");

    try {
      setIsSubmitting(true);
      const payload = { ...formData };
      Object.keys(payload).forEach(k => payload[k] === '' && delete payload[k]);
      const newRestaurant = await createRestaurant(payload);
      setRestaurants(prev => [...prev, newRestaurant]);
      handleCloseModal();
    } catch {
      setFormError("Failed to create restaurant.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', tagline: '', description: '', location: '', contactInfo: '', bannerImage: '' });
    setPreviewImage(null);
    setFormError(null);
  };

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-red-600" />
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Restaurants</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Restaurants List */}
      {restaurants.length === 0 ? (
        <p className="text-center text-gray-500">No restaurants found. Add your first restaurant!</p>
      ) : (
        <div className="space-y-4">
          {restaurants.map(r => (
            <div key={r.id} className="flex items-center gap-4 bg-white shadow rounded-lg p-3 hover:shadow-md transition">
              <img
                src={r.bannerImage || '/default-image.png'}
                alt={r.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{r.name}</h3>
                {r.tagline && <p className="text-red-600 text-sm">{r.tagline}</p>}
                {r.description && !r.tagline && <p className="text-gray-500 text-sm">{r.description}</p>}
                <p className="text-xs text-gray-400 mt-1">{r.location || 'No address'} • {r.contactInfo || 'No phone'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseModal} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 p-6 overflow-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-4">Add New Restaurant</h2>
            {formError && <p className="text-red-600 mb-4">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="Restaurant Name *" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" required />
              <input type="text" name="tagline" placeholder="Offer / Tagline" value={formData.tagline} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" />
              <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" />
              <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" />
              <input type="text" name="contactInfo" placeholder="Contact Info" value={formData.contactInfo} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" />

              <div className="border-2 border-dashed p-4 rounded-lg text-center relative">
                {previewImage ? (
                  <>
                    <img src={previewImage} alt="Preview" className="w-full h-36 object-cover rounded-lg" />
                    <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-white p-1 rounded-full">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                    <p className="text-sm text-gray-500">Click to upload banner</p>
                  </>
                )}
                <input type="file" id="bannerImage" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">{isSubmitting ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantList;