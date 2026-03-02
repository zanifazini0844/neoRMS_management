import { useState, useEffect, useCallback, useMemo } from 'react';
import RightPanel from '../../shared/panels/RightPanel';
import { getStaff, createStaff, updateStaff, deleteStaff, fetchAndStoreUserRestaurant } from '@/services/staffapi';

function Staff() {
  // Get role early to use in state initialization
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const canAssignManager = role === 'owner';

  const [staff, setStaff] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurantNotFound, setRestaurantNotFound] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    role: canAssignManager ? 'Chef' : 'Chef',
  });

  const summary = useMemo(() => {
    return staff.reduce(
      (acc, member) => {
        if (member.role === 'Manager') acc.managers += 1;
        acc.total += 1;
        return acc;
      },
      { managers: 0, total: 0 }
    );
  }, [staff]);

  const handleOpenPanel = () => {
    const restaurantId = typeof window !== 'undefined' && window.localStorage.getItem('restaurantId');
    if (!restaurantId) {
      // eslint-disable-next-line no-alert
      alert('Please select a restaurant first.');
      return;
    }
    setEditingId(null);
    setIsViewOnly(false);
    setFormValues({ name: '', email: '', password: '', role: canAssignManager ? 'Chef' : 'Chef' });
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setIsViewOnly(false);
  };

  const handleRowClick = (member) => {
    setEditingId(member.id);
    setIsViewOnly(true);
    setFormValues({
      name: member.name,
      email: member.email,
      password: '',
      role: member.role,
    });
    setIsPanelOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Ensure restaurantId is available, fetch if needed
  useEffect(() => {
    const ensureRestaurantId = async () => {
      console.log('[Staff] Component mounted, checking restaurantId...');
      const restaurantId = localStorage.getItem('restaurantId');
      console.log('[Staff] restaurantId from localStorage:', restaurantId);
      console.log('[Staff] All localStorage keys:', Object.keys(localStorage));
      
      if (!restaurantId) {
        console.warn('[Staff] restaurantId not found, attempting to fetch from user data');
        const fetchedId = await fetchAndStoreUserRestaurant();
        console.log('[Staff] Fetched restaurantId:', fetchedId);
        
        if (!fetchedId) {
          console.error('[Staff] Failed to fetch restaurantId');
          setRestaurantNotFound(true);
          setError('No restaurant assigned to this account.');
        } else {
          console.log('[Staff] Successfully fetched and stored restaurantId');
        }
      } else {
        console.log('[Staff] restaurantId already available');
      }
    };

    ensureRestaurantId();
  }, []);

  const fetchStaffList = useCallback(async () => {
    console.log('[Staff] fetchStaffList called');
    console.log('[Staff] restaurantNotFound:', restaurantNotFound);
    console.log('[Staff] restaurantId from localStorage:', localStorage.getItem('restaurantId'));
    
    setLoading(true);
    setError(null);
    try {
      const data = await getStaff();
      console.log('[Staff] Fetched staff data raw:', data);
      
      // Normalize staff data - map fullName to name if needed
      const normalized = Array.isArray(data)
        ? data.map((member) => ({
            ...member,
            name: member.name || member.fullName || 'Unknown',
            email: member.email || '',
            role: member.role || 'Staff',
          }))
        : [];
      
      console.log('[Staff] Normalized staff data:', normalized);
      setStaff(normalized);
    } catch (err) {
      console.error('[Staff] Error fetching staff:', err);
      setError(err?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch staff list if restaurantId exists
    if (!restaurantNotFound) {
      fetchStaffList();
    }
  }, [fetchStaffList, restaurantNotFound]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formValues.name.trim()) {
      alert('Name is required');
      return;
    }
    if (!formValues.email.trim()) {
      alert('Email is required');
      return;
    }
    if (!editingId && !formValues.password) {
      alert('Password is required for new staff');
      return;
    }

    try {
      if (formValues.role === 'Manager' && !canAssignManager) {
        alert('Only owner can add a manager.');
        return;
      }

      const payload = {
        name: formValues.name,
        email: formValues.email,
        role: formValues.role,
      };
      
      // Only include password for new staff or if changed
      if (formValues.password) {
        payload.password = formValues.password;
      }

      if (editingId != null) {
        const updated = await updateStaff(editingId, payload);
        setStaff((prev) =>
          prev.map((m) => (m.id === editingId ? updated || { ...m, ...payload } : m))
        );
      } else {
        const created = await createStaff(payload);
        setStaff((prev) => [...prev, created || { ...payload, id: Date.now(), status: 'Active' }]);
      }

      setIsPanelOpen(false);
      setFormValues({ name: '', email: '', password: '', role: canAssignManager ? 'Chef' : 'Chef' });
    } catch (err) {
      alert(err?.message || 'Failed to save staff.');
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    try {
      await deleteStaff(editingId);
      setStaff((prev) => prev.filter((m) => m.id !== editingId));
      setIsPanelOpen(false);
    } catch (err) {
      alert(err?.message || 'Failed to delete staff.');
    }
  };

  return (
    <section className="space-y-6">
      {/* Error message if restaurant not found */}
      {restaurantNotFound && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            ⚠️ No restaurant assigned to this account. Please contact your administrator.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:max-w-xl">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Managers</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.managers}</p>
          {role !== 'owner' && <p className="mt-1 text-[11px] text-slate-400">Visible to owner only.</p>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Staff</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.total}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Staff members</h2>
        <button
          type="button"
          onClick={handleOpenPanel}
          disabled={restaurantNotFound}
          className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium text-white ${
            restaurantNotFound
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-[#C3110C] hover:bg-[#a30e09]'
          }`}
        >
          Add staff
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading && <div className="p-4 text-sm text-slate-500">Loading staff...</div>}
        {error && <div className="p-4 text-sm text-red-600">Error: {error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Email</th>
                <th className="px-4 py-2 text-left font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => (
                <tr key={member.id} className="cursor-pointer hover:bg-slate-50" onClick={() => handleRowClick(member)}>
                  <td className="px-4 py-2 text-slate-900 font-medium">{member.name}</td>
                  <td className="px-4 py-2 text-slate-700">{member.email}</td>
                  <td className="px-4 py-2 text-slate-700">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                      {member.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Panel */}
      <RightPanel isOpen={isPanelOpen} onClose={handleClosePanel}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="border-b pb-2 mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {isViewOnly ? `View Staff Member - ${formValues.name}` : (editingId ? 'Edit Staff Member' : 'Add New Staff Member')}
            </h3>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              placeholder="Full name"
              disabled={isViewOnly}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                isViewOnly
                  ? 'border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed'
                  : 'border-slate-200 focus:outline-none focus:border-red-500'
              }`}
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              placeholder="staff@example.com"
              disabled={isViewOnly}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                isViewOnly
                  ? 'border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed'
                  : 'border-slate-200 focus:outline-none focus:border-red-500'
              }`}
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Password {!editingId && !isViewOnly ? '*' : isViewOnly ? '(not shown)' : '(leave empty to keep current)'}
            </label>
            <input
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleChange}
              placeholder={isViewOnly ? 'Password hidden in view mode' : (editingId ? 'Leave empty to keep current' : 'Min 6 characters')}
              disabled={isViewOnly}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                isViewOnly
                  ? 'border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed'
                  : 'border-slate-200 focus:outline-none focus:border-red-500'
              }`}
              required={!editingId && !isViewOnly}
            />
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Role *</label>
            <select
              name="role"
              value={formValues.role}
              onChange={handleChange}
              disabled={isViewOnly}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                isViewOnly
                  ? 'border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed'
                  : 'border-slate-200 bg-white focus:outline-none focus:border-red-500'
              }`}
              required
            >
              <option value="Chef">Chef</option>
              <option value="Waiter">Waiter</option>
              {canAssignManager && <option value="Manager">Manager</option>}
            </select>
            {!canAssignManager && (
              <p className="text-xs text-slate-400 mt-1">Only owners can assign manager role</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            {isViewOnly ? (
              <>
                <button
                  type="button"
                  onClick={handleClosePanel}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this staff member?')) {
                      try {
                        await deleteStaff(editingId);
                        setStaff((prev) => prev.filter((m) => m.id !== editingId));
                        setIsPanelOpen(false);
                      } catch (err) {
                        alert(err?.message || 'Failed to delete staff.');
                      }
                    }
                  }}
                  className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-200 transition"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 transition"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleClosePanel}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </RightPanel>
    </section>
  );
}

export default Staff;