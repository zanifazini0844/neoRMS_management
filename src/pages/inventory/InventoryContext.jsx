/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';

const InventoryContext = createContext(null);

const INITIAL_ITEMS = [
  {
    id: 1,
    name: 'Tomato',
    quantity: 50,
    price: 0.5,
    threshold: 20,
    usedCount: 300,
  },
  {
    id: 2,
    name: 'Cheese',
    quantity: 10,
    price: 1.2,
    threshold: 15,
    usedCount: 250,
  },
  {
    id: 3,
    name: 'Olive Oil',
    quantity: 0,
    price: 5.0,
    threshold: 5,
    usedCount: 150,
  },
  {
    id: 4,
    name: 'Basil',
    quantity: 5,
    price: 0.2,
    threshold: 10,
    usedCount: 100,
  },
];

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

