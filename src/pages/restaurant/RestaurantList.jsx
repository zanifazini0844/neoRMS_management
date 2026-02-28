import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import RightPanel from '../../shared/panels/RightPanel';

const MOCK_RESTAURANTS = [
  {
    id: 1,
    name: 'Downtown Branch',
    location: 'Downtown',
    revenue: 120000,
    manager: 'Alice Johnson',
  },
  {
    id: 2,
    name: 'Uptown Branch',
    location: 'Uptown',
    revenue: 95000,
    manager: 'Brian Smith',
  },
];

function RestaurantList() {
  const role =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('role')
      : null;

  const [restaurants, setRestaurants] = useState(MOCK_RESTAURANTS);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    location: '',
    manager: '',
    revenue: '',
  });

  // Owner only view
  if (role !== 'owner') {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleOpenPanel = () => {
    setEditingId(null);
    setFormValues({
      name: '',
      location: '',
      manager: '',
      revenue: '',
    });
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const revenueValue = Number(formValues.revenue || 0);

    if (editingId != null) {
      setRestaurants((prev) =>
        prev.map((rest) =>
          rest.id === editingId
            ? {
                ...rest,
                name: formValues.name,
                location: formValues.location,
                manager: formValues.manager,
                revenue: Number.isNaN(revenueValue) ? rest.revenue : revenueValue,
              }
            : rest,
        ),
      );
    } else {
      const nextId =
        restaurants.length > 0
          ? Math.max(...restaurants.map((r) => r.id)) + 1
          : 1;

      const newRestaurant = {
        id: nextId,
        name: formValues.name,
        location: formValues.location,
        manager: formValues.manager,
        revenue: Number.isNaN(revenueValue) ? 0 : revenueValue,
      };

      setRestaurants((prev) => [...prev, newRestaurant]);
    }

    setIsPanelOpen(false);
  };

  const handleRowClick = (rest) => {
    setEditingId(rest.id);
    setFormValues({
      name: rest.name,
      location: rest.location,
      manager: rest.manager,
      revenue: String(rest.revenue),
    });
    setIsPanelOpen(true);
  };

  const handleDelete = () => {
    if (editingId == null) return;
    setRestaurants((prev) => prev.filter((rest) => rest.id !== editingId));
    setIsPanelOpen(false);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Restaurant list
          </h1>
          <p className="text-xs text-slate-500">
            Owner-only view of all branches and assigned managers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenPanel}
          className="inline-flex items-center rounded-lg bg-[#C3110C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#a30e09]"
        >
          Add restaurant
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">
                  Restaurant
                </th>
                <th className="px-4 py-2 text-left font-medium">
                  Location
                </th>
                <th className="px-4 py-2 text-right font-medium">
                  Revenue
                </th>
                <th className="px-4 py-2 text-left font-medium">
                  Manager
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {restaurants.map((rest) => (
                <tr
                  key={rest.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => handleRowClick(rest)}
                >
                  <td className="px-4 py-2 text-slate-900">
                    {rest.name}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {rest.location}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-900">
                    ${rest.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {rest.manager}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RightPanel isOpen={isPanelOpen} onClose={handleClosePanel}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {editingId ? 'Edit restaurant' : 'Add restaurant'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Create a new branch and assign a manager.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-xs font-medium text-slate-600"
              >
                Restaurant name
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
                htmlFor="revenue"
                className="block text-xs font-medium text-slate-600"
              >
                Revenue (optional)
              </label>
              <input
                id="revenue"
                name="revenue"
                type="number"
                min="0"
                value={formValues.revenue}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="location"
                className="block text-xs font-medium text-slate-600"
              >
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={formValues.location}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="manager"
                className="block text-xs font-medium text-slate-600"
              >
                Manager
              </label>
              <input
                id="manager"
                name="manager"
                type="text"
                required
                value={formValues.manager}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#C3110C]"
              />
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

export default RestaurantList;

