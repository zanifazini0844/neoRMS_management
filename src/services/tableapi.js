// tableapi.js
import api from '@/services/api';

const BASE_URL = '/table';

// helpers for headers and restaurant/tenant ids
const getRestaurantId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('restaurantId');
};

const ensureHeaders = () => {
  try {
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      api.defaults.headers['x-tenant-id'] = tenantId;
    }
  } catch (e) {
    // ignore
  }
};

export const getTables = async () => {
  try {
    const restaurantId = getRestaurantId();
    if (!restaurantId) {
      throw new Error('Restaurant ID not found. Please log in and select a restaurant.');
    }
    ensureHeaders();
    const url = `${BASE_URL}/${restaurantId}`;
    console.log('[getTables] GET', url);
    const res = await api.get(url);
    return res.data?.data || [];
  } catch (err) {
    console.error('[getTables] error', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to fetch tables');
  }
};

export const createTable = async (payload) => {
  try {
    const restaurantId = getRestaurantId();
    if (!restaurantId) {
      throw new Error('Restaurant ID not found.');
    }
    ensureHeaders();
    const url = `${BASE_URL}/${restaurantId}`;
    console.log('[createTable] POST', url, payload);
    const res = await api.post(url, payload);
    return res.data?.data || res.data;
  } catch (err) {
    console.error('[createTable] error', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to create table');
  }
};

export const updateTable = async (tableId, payload) => {
  try {
    const restaurantId = getRestaurantId();
    if (!restaurantId) {
      throw new Error('Restaurant ID not found.');
    }
    ensureHeaders();
    const url = `${BASE_URL}/${restaurantId}/${tableId}`;
    console.log('[updateTable] PATCH', url, payload);
    const res = await api.patch(url, payload);
    return res.data?.data || res.data;
  } catch (err) {
    console.error('[updateTable] error', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to update table');
  }
};

export const deleteTable = async (tableId) => {
  try {
    const restaurantId = getRestaurantId();
    if (!restaurantId) {
      throw new Error('Restaurant ID not found.');
    }
    ensureHeaders();
    const url = `${BASE_URL}/${restaurantId}/${tableId}`;
    console.log('[deleteTable] DELETE', url);
    const res = await api.delete(url);
    return res.data?.data || res.data;
  } catch (err) {
    console.error('[deleteTable] error', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to delete table');
  }
};
