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

export const getRestaurantInventory = async (id) => {
  try {
    ensureHeaders();
    let restaurantId = id;
    if (!restaurantId) {
      restaurantId = getRestaurantId();
    }
    if (!restaurantId) {
      throw new Error('Restaurant ID not found');
    }
    const url = `${BASE_URL}/${restaurantId}`;
    const resp = await api.get(url);
    return resp.data?.data || [];
  } catch (err) {
    console.error('[inventoryapi] getRestaurantInventory failed', err);
    const backendMsg =
      err?.response?.data?.message || err?.message || 'Failed fetching inventory';
    throw new Error(backendMsg);
  }
};

// additional helpers for creating, updating, deleting and adjusting quantities

// helper to build base url with restaurantId stored in local storage
const buildUrl = (path = '') => {
  const restaurantId = getRestaurantId();
  if (!restaurantId) {
    throw new Error('Restaurant ID not found.');
  }
  return `${BASE_URL}/${restaurantId}${path}`;
};

/**
 * Create a new inventory entry.  The Postman spec uses the same
 * endpoint for both "existing" and "new" inventory; the difference
 * is whether you provide an `ingredientId` or a `name`/`unit` pair.
 *
 * @param {object} body - request body, either
 *    { ingredientId, availableQuantity, thresholdQuantity }
 *  or { name, unit, availableQuantity, thresholdQuantity }
 * @returns {Promise<object>} the created inventory object from the server
 */
export const createRestaurantInventory = async (body) => {
  try {
    ensureHeaders();
    const url = buildUrl('');
    console.log('[inventoryapi] Creating inventory with:', { url, body });
    const resp = await api.post(url, body);
    console.log('[inventoryapi] Creation successful:', resp.data?.data);
    return resp.data?.data;
  } catch (err) {
    console.error('[inventoryapi] createRestaurantInventory failed', err);
    // Extract detailed error message from backend response
    const backendMsg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Failed creating inventory';
    throw new Error(backendMsg);
  }
};

/**
 * Update the inventory entry identified by restaurantInventoryId.
 * Body should match PATCH expectations:
 * { availableQuantity?, thresholdQuantity? }
 */
export const updateRestaurantInventory = async (
  restaurantInventoryId,
  body
) => {
  try {
    ensureHeaders();
    const url = buildUrl(`/${restaurantInventoryId}`);
    const resp = await api.patch(url, body);
    return resp.data?.data;
  } catch (err) {
    console.error('[inventoryapi] updateRestaurantInventory failed', err);
    const backendMsg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Failed updating inventory';
    throw new Error(backendMsg);
  }
};

export const deleteRestaurantInventory = async (
  restaurantId,
  restaurantInventoryId
) => {
  try {
    ensureHeaders();
    let url;

    if (restaurantId) {
      // standard route using both ids
      url = `${BASE_URL}/${restaurantId}/${restaurantInventoryId}`;
    } else {
      // fallback route that only needs the inventory id
      url = `${BASE_URL}/item/${restaurantInventoryId}`;
    }

    console.log('[inventoryapi] deleting via', url);
    const resp = await api.delete(url);
    return resp.data?.data;
  } catch (err) {
    console.error('[inventoryapi] deleteRestaurantInventory failed', err);
    const backendMsg =
      err?.response?.data?.message || err?.message || 'Failed deleting inventory';
    throw new Error(backendMsg);
  }
};

export const addInventoryQuantity = async (restaurantInventoryId, amount) => {
  try {
    ensureHeaders();
    const url = buildUrl(`/${restaurantInventoryId}/add`);
    const resp = await api.patch(url, { amount });
    return resp.data?.data;
  } catch (err) {
    console.error('[inventoryapi] addInventoryQuantity failed', err);
    throw new Error(
      err?.response?.data?.message || err?.message || 'Failed adding quantity'
    );
  }
};

export const subtractInventoryQuantity = async (
  restaurantInventoryId,
  amount
) => {
  try {
    ensureHeaders();
    const url = buildUrl(`/${restaurantInventoryId}/subtract`);
    const resp = await api.patch(url, { amount });
    return resp.data?.data;
  } catch (err) {
    console.error('[inventoryapi] subtractInventoryQuantity failed', err);
    throw new Error(
      err?.response?.data?.message || err?.message || 'Failed subtracting quantity'
    );
  }
};
