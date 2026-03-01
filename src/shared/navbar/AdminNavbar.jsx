import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Search, Bell } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import { useInventory } from '../../pages/inventory/InventoryContext';
import { useSearch } from '../../shared/search/SearchContext';
import { fetchUserProfile, fetchRestaurantInfo } from '@/services/navapi';

function AdminNavbar() {
  const { totalAlertCount, getLowStockItems, getOutOfStockItems } = useInventory();
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();

  const userNameStored =
    (typeof window !== 'undefined' && window.localStorage.getItem('userName')) || 'User';

  const [userName, setUserName] = useState(userNameStored);
  const [restaurantName, setRestaurantName] = useState('');

  const avatarLetter = (userName || 'U').charAt(0).toUpperCase();

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        if (data?.fullName) setUserName(data.fullName);

        const rname = data?.associatedRestaurants?.[0]?.restaurant?.name;
        if (rname) setRestaurantName(rname);
      } catch {
        // keep defaults silently
      }
    };

    loadProfile();
  }, []);

  // Load restaurant separately (optional if needed)
  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const data = await fetchRestaurantInfo();
        if (data?.name) setRestaurantName(data.name);
      } catch (err) {
        console.error("Error fetching restaurant:", err);
      }
    };

    loadRestaurant();
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    navigate('/admin/search');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
    navigate("/auth/sign-in", { replace: true });
  };

  return (
    <div className="h-16 border-b bg-white flex items-center px-4 gap-4">

      {/* Left: Restaurant Name */}
      <div className="flex items-center bg-red-50 px-4 py-2 rounded-xl shadow-md border border-red-200 max-w-max">
        <h1 className="text-lg md:text-2xl font-semibold text-red-700 tracking-wide">
          {restaurantName || "Restaurant Name"}
        </h1>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center">
        <form onSubmit={handleSearchSubmit} className="w-full max-w-md">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu, staff, inventory"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </form>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">

        {/* 🔔 Notifications Popover */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            >
              <Bell className="h-4 w-4" />
              {totalAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C3110C] px-1 text-[9px] font-semibold text-white">
                  {totalAlertCount}
                </span>
              )}
            </button>
          </Popover.Trigger>

          <Popover.Content
            side="bottom"
            align="end"
            sideOffset={8}
            className="z-50 w-80 max-h-[400px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
          >
            <h3 className="text-xs font-semibold text-slate-900 mb-2">
              Inventory alerts
            </h3>

            {totalAlertCount === 0 ? (
              <p className="text-xs text-slate-500">
                All inventory healthy. No low or out-of-stock items.
              </p>
            ) : (
              <div className="space-y-3 text-xs">

                {/* Out of stock */}
                <div>
                  <p className="mb-1 font-semibold text-rose-600">
                    Out of stock
                  </p>
                  <ul className="space-y-1">
                    {getOutOfStockItems().map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between rounded-md bg-rose-50 px-2 py-1 text-rose-800"
                      >
                        <span className="truncate">{item.name}</span>
                        <span className="ml-2 text-[11px]">0 left</span>
                      </li>
                    ))}
                    {getOutOfStockItems().length === 0 && (
                      <p className="text-[11px] text-slate-400">
                        No items fully out of stock.
                      </p>
                    )}
                  </ul>
                </div>

                {/* Low stock */}
                <div>
                  <p className="mb-1 font-semibold text-amber-600">
                    Low stock
                  </p>
                  <ul className="space-y-1">
                    {getLowStockItems().map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between rounded-md bg-amber-50 px-2 py-1 text-amber-800"
                      >
                        <span className="truncate">{item.name}</span>
                        <span className="ml-2 text-[11px]">
                          {item.quantity} left
                        </span>
                      </li>
                    ))}
                    {getLowStockItems().length === 0 && (
                      <p className="text-[11px] text-slate-400">
                        No items in low stock.
                      </p>
                    )}
                  </ul>
                </div>

              </div>
            )}
          </Popover.Content>
        </Popover.Root>

        {/* 👤 Avatar Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 hover:bg-slate-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {avatarLetter}
              </span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="min-w-[160px] rounded-md border border-slate-200 bg-white p-1 shadow-lg"
          >
            <DropdownMenu.Item
              className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-slate-700 outline-none hover:bg-slate-100"
              onSelect={() => navigate('/admin/profile')}
            >
              Profile
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />

            <DropdownMenu.Item
              className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none hover:bg-red-50"
              onSelect={handleLogout}
            >
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

      </div>
    </div>
  );
}

export default AdminNavbar;