// orderapi.js
import api from '@/services/api';

const BASE_URL = '/order/restaurant-orders';

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

/**
 * Fetch all orders for a restaurant
 * @param {string} restaurantId - Optional restaurant ID, uses localStorage if not provided
 * @returns {Promise<Array>} Array of orders
 */
export const getRestaurantOrders = async (restaurantId) => {
  try {
    ensureHeaders();
    let id = restaurantId;
    if (!id) {
      id = getRestaurantId();
    }
    if (!id) {
      throw new Error('Restaurant ID not found');
    }
    const url = `${BASE_URL}/${id}`;
    const resp = await api.get(url);
    return resp.data?.data || [];
  } catch (err) {
    console.error('[orderapi] getRestaurantOrders failed', err);
    const backendMsg =
      err?.response?.data?.message || err?.message || 'Failed fetching orders';
    throw new Error(backendMsg);
  }
};

/**
 * Get order statistics (counts by status)
 * @param {Array} orders - Array of orders from API
 * @returns {object} Statistics object with pending, cooking, ready, served counts
 */
export const getOrderStats = (orders = []) => {
  return orders.reduce(
    (acc, order) => {
      const status = order.status?.toLowerCase() || '';
      if (status === 'pending') acc.pending += 1;
      if (status === 'preparing') acc.preparing += 1;
      if (status === 'ready') acc.ready += 1;
      if (status === 'delivered') acc.delivered += 1;
      acc.total += 1;
      return acc;
    },
    { total: 0, pending: 0, preparing: 0, ready: 0, delivered: 0 }
  );
};
