import { useMemo, useState } from 'react';
import RightPanel from '../../shared/panels/RightPanel';
import { MOCK_STAFF } from '@/mocks/mockData';

function Staff() {
  const [staff, setStaff] = useState(MOCK_STAFF);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'Chef',
  });

  const role =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('role')
      : null;

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
    setEditingId(null);
    setFormValues({
      name: '',
      phone: '',
      email: '',
      password: '',
      role: 'Chef',
    });
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (formValues.role === 'Manager' && !canAssignManager) {
      // Block in UI (extra guard)
      // eslint-disable-next-line no-alert
      alert('Only owner can add a manager.');
      return;
    }

    if (editingId != null) {
      setStaff((prev) =>
        prev.map((member) =>
          member.id === editingId
            ? {
                ...member,
                name: formValues.name,
                phone: formValues.phone,
                email: formValues.email,
                role: formValues.role,
              }
            : member,
        ),
      );
    } else {
      const nextId =
        staff.length > 0 ? Math.max(...staff.map((m) => m.id)) + 1 : 1;

      const newStaff = {
        id: nextId,
        name: formValues.name,
        phone: formValues.phone,
        email: formValues.email,
        role: formValues.role,
        status: 'Active',
      };

      setStaff((prev) => [...prev, newStaff]);
    }

    setIsPanelOpen(false);
  };

  const handleDelete = () => {
    if (editingId == null) return;
    setStaff((prev) => prev.filter((member) => member.id !== editingId));
    setIsPanelOpen(false);
  };

  return (
    <section className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:max-w-xl">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Total Managers
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {summary.managers}
          </p>
          {role !== 'owner' && (
            <p className="mt-1 text-[11px] text-slate-400">
              Visible to owner only for management decisions.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Total Staff
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {summary.total}
          </p>
        </div>
      </div>

      {/* Header + Add button */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Staff members
        </h2>
        <button
          type="button"
          onClick={handleOpenPanel}
          className="inline-flex items-center rounded-lg bg-[#C3110C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#a30e09]"
        >
          Add staff
        </button>
      </div>

      {/* Staff table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
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
                <tr
                  key={member.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => handleRowClick(member)}
                >
                  <td className="px-4 py-2 text-slate-900">
                    {member.name}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {member.phone}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {member.email}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {member.role}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        member.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add staff right panel */}
      <RightPanel isOpen={isPanelOpen} onClose={handleClosePanel}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {editingId ? 'Edit staff member' : 'Add staff member'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Owners and managers can add new team members. Only owners
              can add managers.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-xs font-medium text-slate-600"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formValues.name}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="phone"
                className="block text-xs font-medium text-slate-600"
              >
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formValues.phone}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-600"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formValues.email}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-600"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formValues.password}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="role"
                className="block text-xs font-medium text-slate-600"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formValues.role}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              >
                <option value="Chef">Chef</option>
                <option value="Waiter">Waiter</option>
                <option value="Manager" disabled={!canAssignManager}>
                  Manager {canAssignManager ? '' : '(owner only)'}
                </option>
              </select>
              {!canAssignManager && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Managers cannot add other managers.
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            {editingId != null && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={handleClosePanel}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#C3110C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#a30e09]"
            >
              Save
            </button>
          </div>
        </form>
      </RightPanel>
    </section>
  );
}

export default Staff;

