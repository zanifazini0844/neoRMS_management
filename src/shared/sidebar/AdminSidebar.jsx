import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Users,
  BarChart3,
  UserCircle,
  LogOut,
  UtensilsCrossed,
  LayoutGrid,
} from 'lucide-react';

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
    navigate('/login', { replace: true });
  };

  const topItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/admin', end: true },
    { label: 'Orders', icon: ShoppingBag, to: '/admin/orders' },
    { label: 'Menu', icon: Utensils, to: '/admin/menu' },
    { label: 'Tables', icon: LayoutGrid, to: '/admin/tables' },
    { label: 'Staff', icon: Users, to: '/admin/staff' },
    { label: 'Analytics', icon: BarChart3, to: '/admin/analytics' },
  ];

  const navItemClasses = (isActive) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
      isActive
        ? 'bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] text-white shadow-lg shadow-red-200'
        : 'text-slate-600 hover:text-[#FF4D4F] hover:bg-[#FFF5F5]'
    }`;

  return (
    <div className="h-full bg-white text-slate-900 shadow-xl w-64 flex flex-col border-r border-slate-200">
      {/* Header/Logo Section */}
      <div className="px-6 py-8 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#FF4D4F] to-[#FF7F7F] flex items-center justify-center text-white shadow-lg">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-slate-900">neoRMS</p>
            <p className="text-xs text-slate-500 font-medium">Restaurant Management</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3">
          Main Menu
        </p>

        {topItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) => navItemClasses(isActive)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-200" />

      {/* Bottom section */}
      <div className="px-4 py-4 space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3">
          Account
        </p>

        <NavLink
          to="/admin/profile"
          className={({ isActive }) => navItemClasses(isActive)}
        >
          <UserCircle className="h-5 w-5 flex-shrink-0" />
          <span>Profile</span>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className={navItemClasses(false).replace(
            'text-slate-600 hover:text-[#FF4D4F] hover:bg-[#FFF5F5]',
            'text-red-600 hover:text-white hover:bg-red-500'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>

      {/* Footer info */}
      <div className="px-4 py-4 border-t border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-500 text-center font-medium">
          © 2026 neoRMS. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default AdminSidebar;