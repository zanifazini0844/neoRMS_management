import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Search, Bell, Building2 } from 'lucide-react';
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
  const [avatarUrl, setAvatarUrl] = useState(null);

  const avatarLetter = (userName || 'U').charAt(0).toUpperCase();

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        if (data?.fullName) setUserName(data.fullName);
        if (data?.avatar) setAvatarUrl(data.avatar);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.debug('AdminNavbar.loadProfile error', err);
      }
    };

    loadProfile().catch(() => {});
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

    loadRestaurant().catch(() => {});
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    // include query param so results page can reload and retain state
    navigate(`/admin/search?query=${encodeURIComponent(trimmed)}`);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
    navigate("/auth/sign-in", { replace: true });
  };

  return (
    <div className="h-20 border-b bg-white flex items-center px-6 gap-6 shadow-sm">

      {/* Left: Restaurant Name - Professional Badge */}
      <div className="flex items-center gap-3 min-w-max">
        <div className="p-2.5 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Restaurant</span>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            {restaurantName || "Restaurant Name"}
          </h1>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center">
        <form onSubmit={handleSearchSubmit} className="w-full max-w-lg">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 hover:bg-white transition-colors shadow-sm hover:shadow-md">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu, staff, inventory..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-700"
            />
          </div>
        </form>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {/* 🔔 Notifications Popover */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <Bell className="h-4.5 w-4.5" />
              {totalAlertCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-700 px-1.5 text-[9px] font-bold text-white shadow-lg">
                  {totalAlertCount}
                </span>
              )}
            </button>
          </Popover.Trigger>

          <Popover.Content
            side="bottom"
            align="end"
            sideOffset={12}
            className="z-50 w-96 max-h-[450px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-widest">
              Inventory Alerts
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
                        <span className="ml-2 text-[11px]">stock out product</span>
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
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 text-sm font-bold text-white overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}
              </span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            align="end"
            sideOffset={12}
            className="min-w-[180px] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
          >
            <DropdownMenu.Item
              className="flex cursor-pointer items-center rounded-none px-4 py-2.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 transition-colors"
              onSelect={() => navigate('/admin/profile')}
            >
              Profile
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />

            <DropdownMenu.Item
              className="flex cursor-pointer items-center rounded-none px-4 py-2.5 text-sm font-medium text-red-600 outline-none hover:bg-red-50 transition-colors"
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