import { useEffect, useState } from 'react';
import api from '../../services/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const role = typeof window !== 'undefined' ? window.localStorage.getItem('role') : null;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/me');
      const data = res.data.data;
      setProfile(data);
      setFullName(data.fullName || '');
      setPhone(data.phone || '');
    } catch (err) {
      // console.error(err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await api.patch('/user/me', { fullName, phone });
      await fetchProfile();
      alert('Profile updated');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!profile) return <p>Failed to load profile.</p>;

  const avatarLetter = (profile?.fullName || 'U').charAt(0).toUpperCase();

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        {/* Profile image */}
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-full bg-[#C3110C] text-white flex items-center justify-center text-2xl font-semibold">
            {avatarLetter}
          </div>
        </div>

        {/* Editable form */}
        <form className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="name" className="block text-xs font-medium text-slate-600">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-medium text-slate-600">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={profile?.email || ''}
              readOnly
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm bg-slate-50 outline-none"
            />
          </div>

          
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-lg bg-[#C3110C] px-4 py-2 text-xs font-medium text-white hover:bg-[#a30e09] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Update profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Manager-only attendance or restaurant info */}
      {role === 'manager' && profile?.associatedRestaurants && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-medium text-slate-700">Restaurant</h3>
          <p className="text-sm text-slate-600">{profile.associatedRestaurants[0]?.restaurant?.name || '—'}</p>
        </div>
      )}
    </section>
  );
}

export default Profile;
