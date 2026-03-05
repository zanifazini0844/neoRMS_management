import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import RightPanel from '../../shared/panels/RightPanel';
import Pagination from '../../shared/Pagination';
import { useSearch } from '../../shared/search/SearchContext';
import { getStaff, createStaff, updateStaff, deleteStaff, fetchAndStoreUserRestaurant } from '@/services/staffapi';
import { Users, Coffee, ShoppingBag, Target } from 'lucide-react';

function Staff() {
  // Get role early to use in state initialization
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const canAssignManager = role === 'owner';

  const [staff, setStaff] = useState([]);
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurantNotFound, setRestaurantNotFound] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    role: canAssignManager ? 'Chef' : 'Chef',
  });

  const summary = useMemo(() => {
    if (!staff || staff.length === 0) {
      console.log('[Staff] Summary: Staff array is empty');
      return { managers: 0, chefs: 0, waiters: 0, total: 0 };
    }
    
    console.log('[Staff] Calculating summary for staff:', staff.map(s => ({ name: s.name, role: s.role })));
    
    const result = staff.reduce(
      (acc, member) => {
        const role = (member.role || '').toLowerCase().trim();
        console.log(`[Staff] Processing member: ${member.name}, role: ${member.role}, normalized: ${role}`);
        
        if (role === 'manager') acc.managers += 1;
        if (role === 'chef') acc.chefs += 1;
        if (role === 'waiter') acc.waiters += 1;
        acc.total += 1;
        
        return acc;
      },
      { managers: 0, chefs: 0, waiters: 0, total: 0 }
    );
    
    console.log('[Staff] Final summary:', result);
    return result;
  }, [staff]);

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter((member) => {
      const haystack = [member.name, member.email, member.role].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [staff, searchQuery]);

  const filteredByRole = useMemo(() => {
    let result = filteredStaff;
    if (selectedRole) {
      result = filteredStaff.filter((member) => 
        member.role?.toLowerCase() === selectedRole.toLowerCase()
      );
    }
    return result;
  }, [filteredStaff, selectedRole]);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredByRole]);

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredByRole.slice(start, start + pageSize);
  }, [filteredByRole, currentPage]);

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
  // sync query param into global search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('query') || '';
    if (q && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [location.search, searchQuery, setSearchQuery]);

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
        const normalized = updated
          ? { ...updated, name: updated.name || updated.fullName || payload.name }
          : { ...payload, id: editingId };
        setStaff((prev) =>
          prev.map((m) => (m.id === editingId ? normalized : m))
        );
      } else {
        const created = await createStaff(payload);
        const normalized = created
          ? { ...created, name: created.name || created.fullName || payload.name }
          : { ...payload, id: Date.now(), status: 'Active' };
        setStaff((prev) => [...prev, normalized]);
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
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-8 space-y-8">
      {/* Error message if restaurant not found */}
      {restaurantNotFound && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-4">
          <div className="text-2xl">⚠️</div>
          <p className="text-sm font-semibold text-red-800">
            No restaurant assigned to this account. Please contact your administrator.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] bg-clip-text text-transparent">
            Staff Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your restaurant team members
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenPanel}
          disabled={restaurantNotFound}
          className={`px-5 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 ${
            restaurantNotFound
              ? 'bg-slate-400 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          ➕ Add Staff Member
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="group relative rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-6 overflow-hidden">
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Staff</p>
              <p className="mt-3 text-3xl font-bold text-slate-900 group-hover:text-[#FF4D4F] transition-colors">
                {summary.total}
              </p>
            </div>
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-[#FF4D4F] to-[#FF7F7F] transition-opacity"></div>
        </div>

        <div className="group relative rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-6 overflow-hidden">
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Chefs</p>
              <p className="mt-3 text-3xl font-bold text-slate-900 group-hover:text-[#FF4D4F] transition-colors">{summary.chefs}</p>
            </div>
            <Coffee className="w-8 h-8 text-slate-400" />
          </div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-[#FF4D4F] to-[#FF7F7F] transition-opacity"></div>
        </div>

        <div className="group relative rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-6 overflow-hidden">
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Waiters</p>
              <p className="mt-3 text-3xl font-bold text-slate-900 group-hover:text-[#FF4D4F] transition-colors">{summary.waiters}</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-slate-400" />
          </div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-[#FF4D4F] to-[#FF7F7F] transition-opacity"></div>
        </div>

        <div className="group relative rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-6 overflow-hidden">
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Managers</p>
              <p className="mt-3 text-3xl font-bold text-slate-900 group-hover:text-[#FF4D4F] transition-colors">{summary.managers}</p>
              {role !== 'owner' && <p className="text-xs text-slate-400 mt-2">Visible to owner only</p>}
            </div>
            <Target className="w-8 h-8 text-slate-400" />
          </div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-[#FF4D4F] to-[#FF7F7F] transition-opacity"></div>
        </div>
      </div>

      {/* Role Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedRole(null)}
          className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-200 ${
            selectedRole === null
              ? 'bg-[#FF4D4F] text-white shadow-lg'
              : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          }`}
        >
          All Staff
        </button>
        <button
          onClick={() => setSelectedRole('Manager')}
          className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-200 ${
            selectedRole === 'Manager'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-purple-50 text-purple-700 border border-purple-200 hover:shadow-md'
          }`}
        >
          <Target className="inline-block w-4 h-4 mr-2" />
          Manager
        </button>
        <button
          onClick={() => setSelectedRole('Chef')}
          className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-200 ${
            selectedRole === 'Chef'
              ? 'bg-orange-600 text-white shadow-lg'
              : 'bg-orange-50 text-orange-700 border border-orange-200 hover:shadow-md'
          }`}
        >
          <Coffee className="inline-block w-4 h-4 mr-2" />
          Chef
        </button>
        <button
          onClick={() => setSelectedRole('Waiter')}
          className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-200 ${
            selectedRole === 'Waiter'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-blue-50 text-blue-700 border border-blue-200 hover:shadow-md'
          }`}
        >
          <ShoppingBag className="inline-block w-4 h-4 mr-2" />
          Waiter
        </button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4D4F] mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Loading staff...</p>
            </div>
          </div>
        )}
        {error && !loading && (
          <div className="p-6 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}
        {!loading && filteredStaff.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3"><Users className="inline-block w-10 h-10 text-slate-400" /></div>
            <p className="text-slate-600 font-medium">No staff members found</p>
            <p className="text-sm text-slate-500 mt-1">Add your first team member to get started</p>
          </div>
        )}

        {!loading && staff.length > 0 && filteredByRole.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3"><Users className="inline-block w-10 h-10 text-slate-400" /></div>
            <p className="text-slate-600 font-medium">No {selectedRole} found</p>
            <p className="text-sm text-slate-500 mt-1">No staff members with the selected role</p>
          </div>
        )}
        {!loading && filteredByRole.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStaff.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors duration-150 border-b border-slate-100 last:border-0"
                      onClick={() => handleRowClick(member)}
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">{member.name}</td>
                      <td className="px-6 py-4 text-slate-600">{member.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                          {member.role?.toLowerCase() === 'chef' && <Coffee className="w-4 h-4 mr-1" />}
                          {member.role?.toLowerCase() === 'waiter' && <ShoppingBag className="w-4 h-4 mr-1" />}
                          {member.role?.toLowerCase() === 'manager' && <Target className="w-4 h-4 mr-1" />}
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700">
                          ✓ Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredByRole.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Right Panel */}
      <RightPanel isOpen={isPanelOpen} onClose={handleClosePanel}>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              {isViewOnly ? `👤 View ${formValues.name}` : (editingId ? '✏️ Edit Staff Member' : '➕ Add New Staff Member')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isViewOnly ? 'View member details' : (editingId ? 'Update staff information' : 'Add a new team member')}
            </p>
          </div>

          <div className="space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto pr-3">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Name *</label>
              <input
                type="text"
                name="name"
                value={formValues.name}
                onChange={handleChange}
                placeholder="Full name"
                disabled={isViewOnly}
                className={`w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all ${
                  isViewOnly ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : ''
                }`}
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email *</label>
              <input
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                placeholder="staff@example.com"
                disabled={isViewOnly}
                className={`w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all ${
                  isViewOnly ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : ''
                }`}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password {!editingId && !isViewOnly ? '*' : `${isViewOnly ? '(not shown)' : '(leave empty to keep current)'}`}
              </label>
              <input
                type="password"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                placeholder={isViewOnly ? 'Password hidden in view mode' : (editingId ? 'Leave empty to keep current' : 'Min 6 characters')}
                disabled={isViewOnly}
                className={`w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all ${
                  isViewOnly ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : ''
                }`}
                required={!editingId && !isViewOnly}
              />
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Role *</label>
              <select
                name="role"
                value={formValues.role}
                onChange={handleChange}
                disabled={isViewOnly}
                className={`w-full rounded-lg border border-slate-300 px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/10 transition-all ${
                  isViewOnly ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : ''
                }`}
                required
              >
                <option value="Chef">Chef</option>
                <option value="Waiter">Waiter</option>
                {canAssignManager && <option value="Manager">Manager</option>}
              </select>
              {!canAssignManager && (
                <p className="text-xs text-slate-500">Only owners can assign manager role</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex gap-3 border-t border-slate-200 sticky bottom-0 bg-white">
            {isViewOnly ? (
              <>
                <button
                  type="button"
                  onClick={handleClosePanel}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
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
                  className="flex-1 px-4 py-3 rounded-lg bg-red-50 text-red-700 font-semibold text-sm hover:bg-red-100 transition-colors"
                >
                  🗑️ Delete
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleClosePanel}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  {editingId ? '✓ Update' : '✓ Create'}
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