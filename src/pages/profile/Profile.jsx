import { useEffect, useState } from 'react';
import api from '../../services/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const role = typeof window !== 'undefined' ? window.localStorage.getItem('role') : null;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/me');
      const data = res.data.data;
      setProfile(data);
    } catch (err) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleOpenDrawer = () => {
    setFormData({
      fullName: profile?.fullName || '',
      email: profile?.email || '',
    });
    setMessage({ type: '', text: '' });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setMessage({ type: '', text: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      await api.patch('/user/me', { fullName: formData.fullName, email: formData.email });
      await fetchProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        handleCloseDrawer();
      }, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!profile) return <p>Failed to load profile.</p>;

  const avatarLetter = (profile?.fullName || 'U').charAt(0).toUpperCase();

  return (
    <section className="space-y-6">
      {/* Main Profile Card - Read Only */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        {/* Profile Avatar */}
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-full bg-[#C3110C] text-white flex items-center justify-center text-2xl font-semibold">
            {avatarLetter}
          </div>
        </div>

        {/* Profile Info Display */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Full Name Display */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">Full Name</label>
              <p className="text-sm text-slate-900 font-medium">{profile?.fullName || '—'}</p>
            </div>

            {/* Email Display */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">Email</label>
              <p className="text-sm text-slate-900 font-medium">{profile?.email || '—'}</p>
            </div>
          </div>

          {/* Update Profile Button */}
          <button
            onClick={handleOpenDrawer}
            className="inline-flex items-center rounded-lg bg-[#C3110C] px-4 py-2 text-xs font-medium text-white hover:bg-[#a30e09] transition-colors"
          >
            Update Profile
          </button>
        </div>
      </div>

      {/* Manager-only Restaurant Info */}
      {role === 'manager' && profile?.associatedRestaurants && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-medium text-slate-700">Restaurant</h3>
          <p className="text-sm text-slate-600">{profile.associatedRestaurants[0]?.restaurant?.name || '—'}</p>
        </div>
      )}

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 transition-opacity"
          onClick={handleCloseDrawer}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Update Profile</h2>
          <button
            onClick={handleCloseDrawer}
            className="text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Close drawer"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 h-[calc(100%-120px)] flex flex-col">
          {/* Full Name Field */}
          <div className="space-y-1">
            <label htmlFor="fullName" className="block text-xs font-medium text-slate-600">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleFormChange}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C3110C] focus:ring-1 focus:ring-[#C3110C]"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email Field (read-only) */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-medium text-slate-600">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              readOnly
              disabled
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-slate-50 text-slate-600 outline-none cursor-not-allowed"
            />
          </div>

          {/* Message Display */}
          {message.text && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-auto flex gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-[#C3110C] px-4 py-2 text-sm font-medium text-white hover:bg-[#a30e09] disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Profile;
