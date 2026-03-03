// inventoryapi.js
import api from '@/services/api';

const BASE_URL = '/inventory/restaurantInventory';

const getRestaurantId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('restaurantId');
};

const getTenantId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tenantId');
};

const ensureHeaders = () => {
  const tenantId = getTenantId();
  if (tenantId) {
    api.defaults.headers['x-tenant-id'] = tenantId;
  }
};

export const getRestaurantInventory = async () => {
  try {
    const restaurantId = getRestaurantId();
    if (!restaurantId) {
      throw new Error('Restaurant ID not found.');
    }
    ensureHeaders();
    const url = `${BASE_URL}/${restaurantId}`;
    const resp = await api.get(url);
    return resp.data?.data || [];
  } catch (err) {
    console.error('[inventoryapi] getRestaurantInventory failed', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed fetching inventory');
  }
};

// additional helpers could be implemented as needed (create/update etc.)
