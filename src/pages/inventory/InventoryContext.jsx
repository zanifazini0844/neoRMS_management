/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import {
  getRestaurantInventory,
  createRestaurantInventory,
  updateRestaurantInventory,
  deleteRestaurantInventory,
  addInventoryQuantity,
  subtractInventoryQuantity,
} from '@/services/inventoryapi';

const InventoryContext = createContext(null);

// each inventory item is retrieved from the backend API; the
// INITIAL_ITEMS array served only as a placeholder during early
// development.  We now fetch the real list based on the selected
// restaurant.
const INITIAL_ITEMS = [];

function computeStatus(quantity, threshold) {
  if (quantity === 0) return 'out';
  if (quantity <= threshold) return 'low';
  return 'available';
}

export function InventoryProvider({ children }) {
  const [inventoryItems, setInventoryItems] = useState(
    INITIAL_ITEMS.map((item) => ({
      ...item,
      status: computeStatus(item.quantity, item.threshold),
    }))
  );

  // Track loading state for UI feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // simple counter used to re-trigger the fetch effect after we
  // successfully mutate anything on the server.
  const [refreshKey, setRefreshKey] = useState(0);

  // fetch real inventory from the server whenever the refreshKey
  // changes.  reading restaurantId isn’t needed, and we intentionally
  // omit it so a late-written value in localStorage doesn’t block
  // the initial load.
  // read restaurantId fresh each invocation; this allows the
  // effect to bail if the id isn't available yet rather than calling
  // the backend with an invalid URL.
  const restaurantId =
    typeof window !== 'undefined' ? localStorage.getItem('restaurantId') : null;

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!restaurantId) {
        setError('Restaurant ID not available');
        setInventoryItems([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getRestaurantInventory(restaurantId);
        if (!mounted) return;
        console.log('[InventoryContext] Fetched inventory data:', data);
        const fetchedRestaurantId = restaurantId;
        const normalized = data.map((item) => {
          const quantity =
            item.quantity ?? item.availableQuantity ?? 0;
          const threshold =
            item.threshold ?? item.thresholdQuantity ?? 0;

          const nameCandidate =
            item.name ||
            item.ingredientName ||
            (item.ingredient && item.ingredient.name) ||
            '';

          return {
            // primary key of restaurantInventory entry
            id: item.id || item.restaurantInventoryId || item._id,
            // when fetching from a single restaurant we may not get the id
            restaurantId:
              item.restaurantId || item.restaurant_id || fetchedRestaurantId || null,
            name: nameCandidate,
            quantity,
            price: item.price || 0,
            threshold,
            usedCount: item.usedCount || 0,
            status: computeStatus(quantity, threshold),
          };
        });
        setInventoryItems(normalized);
        setIsLoading(false);
      } catch (err) {
        console.warn('[InventoryContext] failed to load inventory', err);
        setError(err.message);
        setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [refreshKey, restaurantId]);

  const refreshInventory = () => setRefreshKey((k) => k + 1);

  const addItem = async ({ name, quantity, threshold }) => {
    // Validate inputs client-side before sending to backend
    if (!name || name.trim() === '') {
      throw new Error('Product name is required');
    }

    const qty = Number(quantity);
    const thr = Number(threshold);

    if (isNaN(qty) || qty < 0) {
      throw new Error('Quantity must be a valid non-negative number');
    }

    if (isNaN(thr) || thr < 0) {
      throw new Error('Threshold must be a valid non-negative number');
    }

    try {
      await createRestaurantInventory({
        name: name.trim(),
        unit: 'KILOGRAM',
        availableQuantity: qty,
        thresholdQuantity: thr,
      });
      refreshInventory();
    } catch (err) {
      console.error('[InventoryContext] addItem failed', err);
      throw err;
    }
  };

  const updateItem = async (id, updates) => {
    try {
      await updateRestaurantInventory(id, {
        availableQuantity:
          updates.quantity != null ? Number(updates.quantity) : undefined,
        thresholdQuantity:
          updates.threshold != null ? Number(updates.threshold) : undefined,
      });
      refreshInventory();
    } catch (err) {
      console.error('[InventoryContext] updateItem failed', err);
      throw err;
    }
  };

  const { lowStockItems, outOfStockItems, totalAlertCount } = useMemo(() => {
    const low = inventoryItems.filter((item) => item.status === 'low');
    const out = inventoryItems.filter((item) => item.status === 'out');
    return {
      lowStockItems: low,
      outOfStockItems: out,
      totalAlertCount: low.length + out.length,
    };
  }, [inventoryItems]);

  // optional helpers exposed to callers in case they want to perform
  // more advanced operations (delete, adjust quantity) from other
  // components.  the API now supports deleting by inventoryId alone,
  // so consumers don't need to always know the restaurantId.
  // arg may be: 123          OR  { id: 123, restaurantId: 'abc' }
  const deleteItem = async (arg) => {
    let restaurantId =
      typeof window !== 'undefined' ? localStorage.getItem('restaurantId') : null;
    let invId;

    if (arg && typeof arg === 'object') {
      invId = arg.id;
      if (arg.restaurantId) {
        restaurantId = arg.restaurantId;
      }
    } else {
      invId = arg;
    }

    console.log('[InventoryContext] deleting inventory entry', {
      invId,
      restaurantId,
    });

    try {
      await deleteRestaurantInventory(restaurantId, invId);
      refreshInventory();
    } catch (err) {
      console.error('[InventoryContext] deleteItem failed', err);
      throw err;
    }
  };

  const addQuantity = async (id, amount) => {
    try {
      await addInventoryQuantity(id, amount);
      refreshInventory();
    } catch (err) {
      console.error('[InventoryContext] addQuantity failed', err);
      throw err;
    }
  };

  const subtractQuantity = async (id, amount) => {
    try {
      await subtractInventoryQuantity(id, amount);
      refreshInventory();
    } catch (err) {
      console.error('[InventoryContext] subtractQuantity failed', err);
      throw err;
    }
  };


  const getLowStockItems = () => lowStockItems;
  const getOutOfStockItems = () => outOfStockItems;

  const value = useMemo(
    () => ({
      inventoryItems,
      isLoading,
      error,
      addItem,
      updateItem,
      deleteItem,
      addQuantity,
      subtractQuantity,
      getLowStockItems,
      getOutOfStockItems,
      totalAlertCount,
    }),
    [
      inventoryItems,
      isLoading,
      error,
      addItem,
      updateItem,
      deleteItem,
      addQuantity,
      subtractQuantity,
      getLowStockItems,
      getOutOfStockItems,
      totalAlertCount,
    ]
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    // Fallback to a safe default to avoid runtime crashes
    return {
      inventoryItems: [],
      isLoading: false,
      error: null,
      addItem: () => {},
      updateItem: () => {},
      deleteItem: () => {},
      addQuantity: () => {},
      subtractQuantity: () => {},
      getLowStockItems: () => [],
      getOutOfStockItems: () => [],
      totalAlertCount: 0,
    };
  }
  return ctx;
}

