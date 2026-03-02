// staffapi.js
import api from '@/services/api';

/**
 * Get restaurantId from localStorage
 */
const getRestaurantId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('restaurantId');
};

/**
 * Get tenantId from localStorage
 */
const getTenantId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tenantId');
};

/**
 * Ensure proper headers are set
 */
const ensureHeaders = () => {
  const tenantId = getTenantId();
  if (tenantId) {
    api.defaults.headers['x-tenant-id'] = tenantId;
  }
};

/**
 * Fetch current user's restaurant and store it
 * Used for managers/staff to get their assigned restaurant
 */
export const fetchAndStoreUserRestaurant = async () => {
  try {
    ensureHeaders();
    
    console.log('[fetchAndStoreUserRestaurant] fetching restaurant list...');
    const resp = await api.get('/restaurant/my-restaurants');
    const list = resp.data?.data || [];
    console.log('[fetchAndStoreUserRestaurant] list returned', list);

    // cache owned restaurant array
    try {
      localStorage.setItem('ownedRestaurants', JSON.stringify(list));
    } catch {}

    // pick the currently selected id or default to first
    let restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId && Array.isArray(list) && list.length > 0) {
      restaurantId = list[0].id;
    }

    if (restaurantId) {
      localStorage.setItem('restaurantId', restaurantId);
      const found = list.find((r) => String(r.id) === String(restaurantId));
      if (found && found.tenantId) {
        localStorage.setItem('tenantId', found.tenantId);
      }
      console.log('[fetchAndStoreUserRestaurant] final restaurantId', restaurantId);
      return restaurantId;
    }

    return null;
  } catch (err) {
    console.warn('[fetchAndStoreUserRestaurant] error fetching restaurant list', err);
    return null;
  }
};

/**
 * Fetch staff list for current restaurant
 */
export const getStaff = async () => {
  try {
    const restaurantId = getRestaurantId();
    
    console.log('[getStaff] Looking for restaurantId...');
    console.log('[getStaff] restaurantId found:', restaurantId);
    console.log('[getStaff] localStorage keys:', Object.keys(localStorage));
    console.log('[getStaff] Full localStorage:', localStorage);
    
    // Better error messaging
    if (!restaurantId) {
      console.error('[getStaff] restaurantId is undefined/null!');
      throw new Error('Restaurant ID not found. Please ensure you are logged in and have selected a restaurant.');
    }

    ensureHeaders();
    
    const url = `/user/restaurant/${restaurantId}/staff`;
    console.log('[getStaff] Request URL:', url);
    
    const response = await api.get(url);
    console.log('[getStaff] Success response:', response.data);
    
    return response.data?.data || [];
  } catch (err) {
    console.error('[getStaff] Failed to fetch staff:', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to fetch staff');
  }
};

/**
 * Create new staff member
 */
export const createStaff = async (payload) => {
  try {
    const restaurantId = getRestaurantId();
    console.log('[createStaff] Starting creation with payload:', payload);
    console.log('[createStaff] restaurantId:', restaurantId);
    
    if (!restaurantId) {
      throw new Error('No restaurant selected. Please select a restaurant first.');
    }
    
    if (!payload.email || !payload.password) {
      throw new Error('Email and password are required.');
    }

    ensureHeaders();
    
    // Build request body with required fields for API
    const body = {
      fullName: payload.name,
      email: payload.email,
      password: payload.password,
      restaurantId: restaurantId,
    };

    // Add optional fields if provided
    if (payload.avatar) {
      body.avatar = payload.avatar;
    }

    // Map role to correct endpoint (default to waiter)
    let endpoint = '/user/staff/waiter';
    if (payload.role === 'Manager') {
      endpoint = '/user/staff/manager';
    } else if (payload.role === 'Chef') {
      endpoint = '/user/staff/chef';
    }

    console.log('[createStaff] Calling endpoint:', endpoint);
    console.log('[createStaff] Request body:', body);
    
    const response = await api.post(endpoint, body);
    console.log('[createStaff] Success response:', response.data);
    
    return response.data?.data;
  } catch (err) {
    console.error('[createStaff] Failed to create staff:', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to create staff');
  }
};

/**
 * Update staff member
 */
export const updateStaff = async (id, payload) => {
  try {
    if (!id) {
      throw new Error('Staff ID is required.');
    }

    ensureHeaders();
    
    const body = {
      fullName: payload.name,
    };

    // Add optional fields if provided
    if (payload.avatar) {
      body.avatar = payload.avatar;
    }
    if (payload.password) {
      body.password = payload.password;
    }

    const response = await api.patch(`/user/${id}`, body);
    return response.data?.data;
  } catch (err) {
    console.error('Failed to update staff:', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to update staff');
  }
};

/**
 * Delete staff member
 */
export const deleteStaff = async (id) => {
  try {
    if (!id) {
      throw new Error('Staff ID is required.');
    }

    ensureHeaders();
    
    const response = await api.delete(`/user/${id}`);
    return response.data;
  } catch (err) {
    console.error('Failed to delete staff:', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to delete staff');
  }
};

export default { getStaff, createStaff, updateStaff, deleteStaff };