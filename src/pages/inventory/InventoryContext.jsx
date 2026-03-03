/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { getRestaurantInventory } from '@/services/inventoryapi';

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

  // fetch real inventory from the server whenever the restaurant changes
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getRestaurantInventory();
        if (!mounted) return;
        const normalized = data.map((item) => ({
          id: item.id || item.restaurantInventoryId || item._id,
          name: item.name || item.ingredientName || '',
          quantity: item.quantity || 0,
          price: item.price || 0,
          threshold: item.threshold || 0,
          usedCount: item.usedCount || 0,
          status: computeStatus(item.quantity || 0, item.threshold || 0),
        }));
        setInventoryItems(normalized);
      } catch (err) {
        console.warn('[InventoryContext] failed to load inventory', err);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const addItem = ({ name, quantity, threshold, price }) => {
    setInventoryItems((prev) => {
      const nextId =
        prev.length > 0 ? Math.max(...prev.map((item) => item.id)) + 1 : 1;
      const qty = Number(quantity);
      const th = Number(threshold);
      const pr = Number(price);

      return [
        ...prev,
        {
          id: nextId,
          name,
          quantity: Number.isNaN(qty) ? 0 : qty,
          threshold: Number.isNaN(th) ? 0 : th,
          price: Number.isNaN(pr) ? 0 : pr,
          usedCount: 0,
          status: computeStatus(qty, th),
        },
      ];
    });
  };

  const updateItem = (id, updates) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const quantity =
          updates.quantity != null ? Number(updates.quantity) : item.quantity;
        const threshold =
          updates.threshold != null
            ? Number(updates.threshold)
            : item.threshold;
        const price =
          updates.price != null ? Number(updates.price) : item.price;

        return {
          ...item,
          ...updates,
          quantity,
          threshold,
          price,
          status: computeStatus(quantity, threshold),
        };
      })
    );
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

  const getLowStockItems = () => lowStockItems;
  const getOutOfStockItems = () => outOfStockItems;

  const value = useMemo(
    () => ({
      inventoryItems,
      addItem,
      updateItem,
      getLowStockItems,
      getOutOfStockItems,
      totalAlertCount,
    }),
    [
      inventoryItems,
      addItem,
      updateItem,
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
      addItem: () => {},
      updateItem: () => {},
      getLowStockItems: () => [],
      getOutOfStockItems: () => [],
      totalAlertCount: 0,
    };
  }
  return ctx;
}

