import { useMemo, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useInventory } from '../../pages/inventory/InventoryContext';
import { useSearch } from '../../shared/search/SearchContext';
// real APIs instead of mocks
import { getMenuProductsByRestaurant } from '@/services/menuapi';
import { getStaff } from '@/services/staffapi';
import { getRestaurantOrders } from '@/services/orderapi';
import { fetchOwnerRestaurants } from '@/services/restaurant/restaurantApi';

function highlightMatch(text, query) {
  if (!query) return text;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);
  return (
    <>
      {before}
      <span className="bg-yellow-100 text-yellow-800">{match}</span>
      {after}
    </>
  );
}

function SearchResults() {
  const { inventoryItems } = useInventory();
  const { searchQuery, setSearchQuery } = useSearch();
  const location = useLocation();

  // when component mounts, initialize searchQuery from URL if provided
  // (we don't watch location.search here, otherwise it would override
  // user edits while still on the same page)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('query') || '';
    if (q) {
      setSearchQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // state for real data
  const [menuItems, setMenuItems] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(
    () => () => {
      setSearchQuery('');
    },
    [setSearchQuery],
  );

  const trimmedQuery = searchQuery.trim();

  // fetch all possible lists once on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [menu, staff, ord, rest] = await Promise.all([
          getMenuProductsByRestaurant().catch(() => []),
          getStaff().catch(() => []),
          getRestaurantOrders().catch(() => []),
          fetchOwnerRestaurants().catch(() => []),
        ]);
        setMenuItems(menu);
        setStaffMembers(
          Array.isArray(staff)
            ? staff.map((m) => ({
                ...m,
                name: m.name || m.fullName || '',
                email: m.email || '',
                role: m.role || '',
              }))
            : []
        );
        setOrders(ord);
        setRestaurants(
          Array.isArray(rest)
            ? rest.map((r) => {
                const id = r.id || r._id || r.restaurantId || r.restaurant_id;
                return { ...r, id, name: r.name || r.restaurantName || '' };
              })
            : []
        );
      } catch (e) {
        console.error('[SearchResults] error loading data', e);
      }
    };
    loadAllData();
  }, []);

  const {
    menuResults,
    inventoryResults,
    staffResults,
    orderResults,
    restaurantResults,
  } = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    if (!q) {
      return {
        menuResults: [],
        inventoryResults: [],
        staffResults: [],
        orderResults: [],
        restaurantResults: [],
      };
    }

    const menuResultsLocal = menuItems.filter((item) => {
      const haystack = [
        item.productTitle || item.name || '',
        item.category || '',
        ...(item.ingredients || []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    const inventoryResultsLocal = inventoryItems.filter((item) => {
      const haystack = `${item.name}`.toLowerCase();
      return haystack.includes(q);
    });

    const staffResultsLocal = staffMembers.filter((member) => {
      const haystack = [
        member.name,
        member.email,
        member.role,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    const orderResultsLocal = orders.filter((order) => {
      const haystack = [
        order.customerName || order.customer || '',
        order.status || '',
        order.id || order._id || '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    const restaurantResultsLocal = restaurants.filter((rest) => {
      const haystack = [rest.name, rest.location || '', rest.id || '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    return {
      menuResults: menuResultsLocal,
      inventoryResults: inventoryResultsLocal,
      staffResults: staffResultsLocal,
      orderResults: orderResultsLocal,
      restaurantResults: restaurantResultsLocal,
    };
  }, [menuItems, staffMembers, inventoryItems, orders, restaurants, trimmedQuery]);

  const hasResults =
    menuResults.length > 0 ||
    inventoryResults.length > 0 ||
    staffResults.length > 0 ||
    orderResults.length > 0 ||
    restaurantResults.length > 0;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Search results
        </h1>
        <p className="text-xs text-slate-500">
          Showing matches for &quot;{trimmedQuery || '...'}&quot; across
          menu, inventory, staff, orders, and restaurants.
        </p>
      </div>

      {!trimmedQuery && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">
            Use the search bar in the top navigation to find menu items,
            inventory, staff, orders, and restaurants.
          </p>
        </div>
      )}

      {trimmedQuery && !hasResults && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <p className="text-sm font-semibold text-slate-900">
            No results found
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Try adjusting your search term or checking for typos.
          </p>
        </div>
      )}

      {trimmedQuery && hasResults && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Menu results */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Menu results
            </h2>
            {menuResults.length === 0 ? (
              <p className="text-xs text-slate-500">No menu matches.</p>
            ) : (
              <ul className="space-y-1 max-h-[400px] overflow-y-auto">
                {menuResults.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-slate-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {highlightMatch(item.productTitle || item.name, trimmedQuery)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {highlightMatch(item.category, trimmedQuery)}
                      </p>
                    </div>
                    <p className="ml-2 text-xs font-semibold text-slate-900">
                      ${(item.price || item.productPrice || 0).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Inventory results */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Inventory results
            </h2>
            {inventoryResults.length === 0 ? (
              <p className="text-xs text-slate-500">
                No inventory matches.
              </p>
            ) : (
              <ul className="space-y-1 max-h-[400px] overflow-y-auto">
                {inventoryResults.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-slate-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {highlightMatch(item.name, trimmedQuery)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Qty: {item.quantity}{' '}
                        {item.status === 'available'
                          ? '(Available)'
                          : item.status === 'low'
                          ? '(Low)'
                          : '(Out)'}
                      </p>
                    </div>
                    <p className="ml-2 text-xs font-semibold text-slate-900">
                      ${(item.price || 0).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Staff results */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Staff results
            </h2>
            {staffResults.length === 0 ? (
              <p className="text-xs text-slate-500">No staff matches.</p>
            ) : (
              <ul className="space-y-1 max-h-[400px] overflow-y-auto">
                {staffResults.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-slate-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {highlightMatch(member.name, trimmedQuery)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {highlightMatch(member.role, trimmedQuery)}
                      </p>
                    </div>
                    <p className="ml-2 text-[11px] text-slate-500 truncate">
                      {highlightMatch(member.email, trimmedQuery)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          </div>
          {/* second row: orders & restaurants */}
          {(orderResults.length > 0 || restaurantResults.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {/* Order results */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Order results
                </h2>
                {orderResults.length === 0 ? (
                  <p className="text-xs text-slate-500">No order matches.</p>
                ) : (
                  <ul className="space-y-1 max-h-[400px] overflow-y-auto">
                    {orderResults.map((order) => (
                      <li
                        key={order.id || order._id}
                        className="rounded-md px-2 py-1 hover:bg-slate-50"
                      >
                        <p className="text-sm font-medium text-slate-900 truncate">
                          #{(order.id || order._id || '').slice(0,6)} - {highlightMatch(order.customerName || order.customer || 'Guest', trimmedQuery)}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {highlightMatch(order.status || '', trimmedQuery)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Restaurant results */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Restaurant results
                </h2>
                {restaurantResults.length === 0 ? (
                  <p className="text-xs text-slate-500">No restaurant matches.</p>
                ) : (
                  <ul className="space-y-1 max-h-[400px] overflow-y-auto">
                    {restaurantResults.map((rest) => (
                      <li
                        key={rest.id}
                        className="rounded-md px-2 py-1 hover:bg-slate-50"
                      >
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {highlightMatch(rest.name, trimmedQuery)}
                        </p>
                        {rest.location && (
                          <p className="text-[11px] text-slate-500">
                            {highlightMatch(rest.location, trimmedQuery)}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default SearchResults;
