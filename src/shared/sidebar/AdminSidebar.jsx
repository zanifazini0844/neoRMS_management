import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Boxes,
  Users,
  BarChart3,
  UserCircle,
  LogOut,
  ChevronDown,
} from 'lucide-react';

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [inventoryOpen, setInventoryOpen] = useState(false);

  // Auto-open inventory dropdown if inside inventory route
  useEffect(() => {
    if (location.pathname.startsWith('/admin/inventory')) {
      setInventoryOpen(true);
    }
  }, [location.pathname]);

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
    { label: 'Inventory', icon: Boxes, isDropdown: true },
    { label: 'Staff', icon: Users, to: '/admin/staff' },
    { label: 'Analytics', icon: BarChart3, to: '/admin/analytics' },
  ];

  const baseItemClasses =
    'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200';

  return (
    <div className="flex h-full flex-col justify-between bg-[#FFF5F5] text-[#2C2C2C] shadow-lg w-64">
    
      {/* Top section */}
      <nav className="px-4 py-6 space-y-2">
        {topItems.map((item) => {
          if (item.isDropdown) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setInventoryOpen(!inventoryOpen)}
                  className={`${baseItemClasses} w-full justify-between ${
                    inventoryOpen || location.pathname.startsWith('/admin/inventory')
                      ? 'bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] text-white shadow-md'
                      : 'text-[#2C2C2C] hover:bg-[#FF4D4F]/10 hover:text-[#FF4D4F]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Boxes className="h-5 w-5" />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 ml-2 transition-transform duration-300 ${
                      inventoryOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {inventoryOpen && (
                  <div className="ml-6 mt-2 flex flex-col space-y-2">
                    <NavLink
                      to="/admin/inventory/overview"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] text-white shadow-md'
                            : 'text-[#FF4D4F]/80 hover:bg-[#FF4D4F]/20'
                        }`
                      }
                    >
                      Overview
                    </NavLink>
                    <NavLink
                      to="/admin/inventory/list"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] text-white shadow-md'
                            : 'text-[#FF4D4F]/80 hover:bg-[#FF4D4F]/20'
                        }`
                      }
                    >
                      Inventory List
                    </NavLink>
                  </div>
                )}
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${baseItemClasses} ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] text-white shadow-md'
                    : 'text-[#FF4D4F]/80 hover:bg-[#FF4D4F]/10 hover:text-[#FF4D4F]'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="font-semibold">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[#FFEDED] px-4 py-6 flex flex-col gap-3">
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `${baseItemClasses} ${
              isActive
                ? 'bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] text-white shadow-md'
                : 'text-[#FF4D4F]/80 hover:bg-[#FF4D4F]/10 hover:text-[#FF4D4F]'
            }`
          }
        >
          <UserCircle className="h-5 w-5" />
          <span className="font-semibold">Profile</span>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className={`${baseItemClasses} justify-start text-[#FF4D4F]/80 hover:bg-[#FF4D4F]/10 hover:text-[#FF4D4F]`}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;