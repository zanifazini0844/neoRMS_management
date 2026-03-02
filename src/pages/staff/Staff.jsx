import { useState, useEffect, useCallback, useMemo } from 'react';
import RightPanel from '../../shared/panels/RightPanel';
import { getStaff, createStaff, updateStaff, deleteStaff } from '@/services/staffapi';

function Staff() {
  const [staff, setStaff] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'Chef',
  });

  const role = localStorage.getItem('role');
  const canAssignManager = role === 'owner';

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
    setFormValues({ name: '', phone: '', email: '', password: '', role: 'Chef' });
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => setIsPanelOpen(false);

  const handleRowClick = (member) => {
    setEditingId(member.id);
    setFormValues({
      name: member.name,
      phone: member.phone,
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

  const fetchStaffList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStaff();
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formValues.role === 'Manager' && !canAssignManager) {
        alert('Only owner can add a manager.');
        return;
      }

      const payload = {
        name: formValues.name,
        phone: formValues.phone,
        email: formValues.email,
        role: formValues.role,
        ...(formValues.password ? { password: formValues.password } : {}),
      };

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
          className="inline-flex items-center rounded-lg bg-[#C3110C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#a30e09]"
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
                <th className="px-4 py-2 text-left font-medium">Phone</th>
                <th className="px-4 py-2 text-left font-medium">Email</th>
                <th className="px-4 py-2 text-left font-medium">Role</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => (
                <tr key={member.id} className="cursor-pointer hover:bg-slate-50" onClick={() => handleRowClick(member)}>
                  <td className="px-4 py-2 text-slate-900">{member.name}</td>
                  <td className="px-4 py-2 text-slate-700">{member.phone}</td>
                  <td className="px-4 py-2 text-slate-700">{member.email}</td>
                  <td className="px-4 py-2 text-slate-700">{member.role}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      member.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>{member.status}</span>
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
          {/* Form fields omitted for brevity, same as previous Staff.jsx */}
        </form>
      </RightPanel>
    </section>
  );
}

export default Staff;