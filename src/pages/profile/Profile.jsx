import { useEffect, useState } from 'react';
import api from '../../services/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
  fullName: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  });
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
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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

  // Password validation
  if (formData.newPassword || formData.currentPassword || formData.confirmPassword) {
    if (!formData.currentPassword) {
      return setMessage({ type: 'error', text: 'Current password is required.' });
    }

    if (formData.newPassword.length < 6) {
      return setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match.' });
    }
  }

  try {
    setSaving(true);
    setMessage({ type: '', text: '' });

    const payload = {
      fullName: formData.fullName,
    };

    // Only send password fields if user is changing password
    if (formData.newPassword) {
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.newPassword;
    }

    await api.patch('/user/me', payload);

    await fetchProfile();

    setMessage({ type: 'success', text: 'Profile updated successfully!' });

    setTimeout(() => {
      handleCloseDrawer();
    }, 1500);
  } catch (err) {
    setMessage({
      type: 'error',
      text: err?.response?.data?.message || 'Failed to update profile.',
    });
  } finally {
    setSaving(false);
  }
};

  if (loading) return <p>Loading...</p>;

  if (!profile) return <p>Failed to load profile.</p>;

  const avatarLetter = (profile?.fullName || 'U').charAt(0).toUpperCase();

 return (
  <section className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 p-8">
    
    {/* Profile Card */}
    <div className="max-w-5xl mx-auto backdrop-blur-xl bg-white/80 border border-white/40 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]">

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-[#C3110C] via-red-600 to-rose-600 p-10 flex flex-col sm:flex-row items-center gap-8">

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md"></div>

        <div className="relative h-28 w-28 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
          {avatarLetter}
        </div>

        <div className="relative text-white text-center sm:text-left">
          <h1 className="text-3xl font-semibold tracking-wide">
            {profile?.fullName}
          </h1>
          <p className="text-sm opacity-90 mt-1">
            {profile?.email}
          </p>
        </div>

        <div className="relative sm:ml-auto">
          <button
            onClick={handleOpenDrawer}
            className="bg-white text-[#C3110C] px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:scale-105 hover:bg-slate-100 transition-all duration-200"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-10 grid md:grid-cols-2 gap-10">
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
            Full Name
          </p>
          <p className="text-xl font-semibold text-slate-800">
            {profile?.fullName || '—'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
            Email
          </p>
          <p className="text-xl font-semibold text-slate-800">
            {profile?.email || '—'}
          </p>
        </div>

        {role === 'manager' && profile?.associatedRestaurants && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              Restaurant
            </p>
            <p className="text-xl font-semibold text-slate-800">
              {profile.associatedRestaurants[0]?.restaurant?.name || '—'}
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Drawer Overlay */}
    {isDrawerOpen && (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleCloseDrawer}
      />
    )}

    {/* Drawer */}
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-50 transform transition-all duration-300 ${
        isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">
          Edit Profile
        </h2>
        <button
          onClick={handleCloseDrawer}
          className="text-slate-400 hover:text-slate-800 text-lg transition"
        >
          ✕
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-8 space-y-6 overflow-y-auto h-[calc(100%-90px)]"
      >
        {/* Full Name */}
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wide">
            Full Name
          </label>
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleFormChange}
            className="w-full mt-2 border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#C3110C] focus:border-[#C3110C] outline-none transition"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wide">
            Email
          </label>
          <input
            value={formData.email}
            disabled
            className="w-full mt-2 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-500"
          />
        </div>

        {/* Password Section */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Change Password
          </h3>

          <div className="space-y-4">
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={formData.currentPassword}
              onChange={handleFormChange}
              className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#C3110C] outline-none"
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleFormChange}
              className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#C3110C] outline-none"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleFormChange}
              className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#C3110C] outline-none"
            />
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`p-4 rounded-2xl text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={handleCloseDrawer}
            className="flex-1 border border-slate-300 py-3 rounded-2xl text-sm font-medium hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-[#C3110C] to-red-600 text-white py-3 rounded-2xl text-sm font-semibold shadow-lg hover:scale-105 transition-all disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  </section>
);}

export default Profile;
