import { useMemo, useEffect } from 'react';
import { useInventory } from '../../pages/inventory/InventoryContext';
import { useSearch } from '../../shared/search/SearchContext';
import { MOCK_MENU, MOCK_STAFF } from '@/mocks/mockData';

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

  useEffect(
    () => () => {
      setSearchQuery('');
    },
    [setSearchQuery],
  );

  const trimmedQuery = searchQuery.trim();

  const { menuResults, inventoryResults, staffResults } = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    if (!q) {
      return {
        menuResults: [],
        inventoryResults: [],
        staffResults: [],
      };
    }

    const menuResultsLocal = MOCK_MENU.filter((item) => {
      const haystack = [
        item.name,
        item.category,
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

    const staffResultsLocal = MOCK_STAFF.filter((member) => {
      const haystack = [
        member.name,
        member.email,
        member.role,
        member.phone,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    return {
      menuResults: menuResultsLocal,
      inventoryResults: inventoryResultsLocal,
      staffResults: staffResultsLocal,
    };
  }, [inventoryItems, trimmedQuery]);

  const hasResults =
    menuResults.length > 0 ||
    inventoryResults.length > 0 ||
    staffResults.length > 0;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Search results
        </h1>
        <p className="text-xs text-slate-500">
          Showing matches for &quot;{trimmedQuery || '...'}&quot; across
          menu, inventory, and staff.
        </p>
      </div>

      {!trimmedQuery && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">
            Use the search bar in the top navigation to find menu items,
            inventory, and staff.
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
                        {highlightMatch(item.name, trimmedQuery)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {highlightMatch(item.category, trimmedQuery)}
                      </p>
                    </div>
                    <p className="ml-2 text-xs font-semibold text-slate-900">
                      ${item.price.toFixed(2)}
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
                      ${item.price.toFixed(2)}
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
      )}
    </section>
  );
}

export default SearchResults;
