import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Boxes,
  Users,
  BarChart3,
  Building2,
  UserCircle,
  LogOut,
} from 'lucide-react';

const baseItemClasses =
  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors';

function AdminSidebar() {
  const navigate = useNavigate();

  const role =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('role')
      : null;

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
    navigate('/login', { replace: true });
  };

  const topItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: '/admin',
      end: true,
    },
    {
      label: 'Orders',
      icon: ShoppingBag,
      to: '/admin/orders',
    },
    {
      label: 'Menu',
      icon: Utensils,
      to: '/admin/menu',
    },
    {
      label: 'Inventory',
      icon: Boxes,
      to: '/admin/inventory',
    },
    {
      label: 'Staff',
      icon: Users,
      to: '/admin/staff',
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      to: '/admin/analytics',
    },
  ];

  const ownerOnlyItem = {
    label: 'Restaurant List',
    icon: Building2,
    to: '/admin/restaurants',
  };

  return (
    <div className="flex h-full flex-col justify-between bg-transparent text-white">
      {/* Top section */}
      <nav className="px-3 py-4 space-y-2">
        {topItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  baseItemClasses,
                  isActive
                    ? 'bg-white text-[#C3110C]'
                    : 'text-white/80 hover:bg-[#E6501B] hover:text-white',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-[#C3110C]' : ''
                    }`}
                  />
                  <span
                    className={isActive ? 'text-[#C3110C]' : undefined}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Owner-only item */}
        {role === 'owner' && (
          <NavLink
            to={ownerOnlyItem.to}
            className={({ isActive }) =>
              [
                baseItemClasses,
                isActive
                  ? 'bg-white text-[#C3110C]'
                  : 'text-white/80 hover:bg-[#E6501B] hover:text-white',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Building2
                  className={`h-4 w-4 ${
                    isActive ? 'text-[#C3110C]' : ''
                  }`}
                />
                <span
                  className={isActive ? 'text-[#C3110C]' : undefined}
                >
                  {ownerOnlyItem.label}
                </span>
              </>
            )}
          </NavLink>
        )}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/20 px-3 py-4 space-y-2">
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            [
              baseItemClasses,
              isActive
                ? 'bg-white text-[#C3110C]'
                : 'text-white/80 hover:bg-[#E6501B] hover:text-white',
            ].join(' ')
          }
        >
          <UserCircle className="h-4 w-4" />
          <span>Profile</span>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className={`${baseItemClasses} w-full justify-start text-white/80 hover:bg-white/10 hover:text-white`}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;

