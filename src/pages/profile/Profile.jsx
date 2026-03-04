import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
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

  // avatar states for editing
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarData, setAvatarData] = useState(undefined);

  const role = typeof window !== 'undefined' ? window.localStorage.getItem('role') : null;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/me');
      const data = res.data.data;
      setProfile(data);
      // initialize avatar preview/data
      setAvatarPreview(data?.avatar || null);
      setAvatarData(data?.avatar || '');
    } catch (err) {
      setProfile(null);
      setAvatarPreview(null);
      setAvatarData(undefined);
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
  // restore avatar state when opening drawer
  setAvatarPreview(profile?.avatar || null);
  setAvatarData(profile?.avatar || '');
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setAvatarData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    // send empty string to backend to clear
    setAvatarData('');
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

    // include avatar when editing profile
    if (avatarData !== undefined) {
      // even empty string will clear existing avatar
      payload.avatar = avatarData;
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
  <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 sm:p-8">
    {/* Page Header */}
    <div className="max-w-5xl mx-auto mb-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] bg-clip-text text-transparent">
        Profile Settings
      </h1>
      <p className="text-slate-600 text-sm mt-2">
        Manage your account details and security preferences
      </p>
    </div>
    
    {/* Profile Card */}
    <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8">
        <div className="h-32 w-32 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-5xl font-bold text-white shadow-lg backdrop-blur-sm overflow-hidden">
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            avatarLetter
          )}
        </div>

        <div className="text-white text-center sm:text-left flex-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {profile?.fullName}
          </h2>
          <p className="text-white/80 text-sm mt-2">
            {profile?.email}
          </p>
          <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-white/30">
              Role: {role?.charAt(0).toUpperCase() + role?.slice(1)}
            </span>
          </div>
        </div>

        <button
          onClick={handleOpenDrawer}
          className="px-6 py-3 rounded-xl bg-white text-[#FF4D4F] font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all whitespace-nowrap"
        >
          Edit Profile
        </button>
      </div>

      {/* Info Section */}
      <div className="p-8 sm:p-10">
        <div className="grid sm:grid-cols-2 gap-6">
          
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 hover:shadow-md hover:border-slate-300 transition-all">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
              Full Name
            </p>
            <p className="text-xl font-bold text-slate-900">
              {profile?.fullName || '—'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 hover:shadow-md hover:border-slate-300 transition-all">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
              Email
            </p>
            <p className="text-xl font-bold text-slate-900">
              {profile?.email || '—'}
            </p>
          </div>

          {role === 'manager' && profile?.associatedRestaurants && (
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 hover:shadow-md hover:border-slate-300 transition-all sm:col-span-2">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
                Associated Restaurant
              </p>
              <p className="text-xl font-bold text-slate-900">
                {profile.associatedRestaurants[0]?.restaurant?.name || '—'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Drawer Overlay */}
    {isDrawerOpen && (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleCloseDrawer}
      />
    )}

    {/* Edit Profile Drawer */}
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 transform transition-all duration-300 overflow-hidden flex flex-col ${
        isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Drawer Header */}
      <div className="sticky top-0 bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] p-6 sm:p-7 flex justify-between items-center border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Edit Profile
        </h2>
        <button
          onClick={handleCloseDrawer}
          className="text-white/60 hover:text-white text-2xl transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Drawer Content */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6"
      >
        {/* Avatar upload section */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-3 border-b border-slate-200">
            Profile Picture
          </h3>
          <div className="mb-6">
            <div className="h-24 w-24 rounded-full bg-gray-100 relative overflow-hidden">
              {avatarPreview ? (
                <>
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute top-0 right-0 bg-white p-1 rounded-full"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <ImagePlus className="h-6 w-6" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Account Information Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-3 border-b border-slate-200">
            Account Information
          </h3>
          
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">
                Full Name
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">
                Email Address
              </label>
              <input
                value={formData.email}
                disabled
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-2">
                Email cannot be changed. Contact support for assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-3 border-b border-slate-200">
            Change Password
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                placeholder="Enter your current password"
                value={formData.currentPassword}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password (min. 6 characters)"
                value={formData.newPassword}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`rounded-lg p-4 text-sm font-medium border-l-4 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border-green-400'
                : 'bg-red-50 text-red-700 border-red-400'
            }`}
          >
            {message.text}
          </div>
        )}
      </form>

      {/* Drawer Footer */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 sm:p-8 flex gap-3">
        <button
          type="button"
          onClick={handleCloseDrawer}
          className="flex-1 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          onClick={handleSubmit}
          className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  </section>
);}

export default Profile;
