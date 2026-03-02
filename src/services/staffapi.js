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
 * Resolve and store tenantId from restaurant info
 */
const resolveTenantId = async (restaurantId) => {
  try {
    if (!restaurantId) return null;
    let tenantId = localStorage.getItem('tenantId');
    if (tenantId) return tenantId; // use cached
    
    // fetch restaurant to get tenant
    const resp = await api.get(`/restaurant/${restaurantId}`);
    tenantId = resp.data?.data?.tenantId;
    if (tenantId) {
      localStorage.setItem('tenantId', tenantId);
      api.defaults.headers['x-tenant-id'] = tenantId;
    }
    return tenantId;
  } catch (e) {
    console.warn('Failed to resolve tenant ID', e);
    return null;
  }
};

/**
 * Fetch staff list for current restaurant
 */
export const getStaff = async () => {
  try {
    const restaurantId = getRestaurantId();
    if (!restaurantId) {
      throw new Error('No restaurant selected. Please select a restaurant first.');
    }
    
    await resolveTenantId(restaurantId);
    
    const response = await api.get(`/user/restaurant/${restaurantId}/staff`);
    return response.data?.data || [];
  } catch (err) {
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to fetch staff');
  }
};

/**
 * Create new staff member
 */
export const createStaff = async (payload) => {
  try {
    const restaurantId = getRestaurantId();
    if (!restaurantId) {
      throw new Error('No restaurant selected. Please select a restaurant first.');
    }
    
    await resolveTenantId(restaurantId);
    
    const body = {
      fullName: payload.name,
      email: payload.email,
      password: payload.password,
      avatar: payload.avatar || null,
      restaurantId: restaurantId,
    };

    // Map role to correct endpoint
    let endpoint = '/user/staff/waiter';
    if (payload.role === 'Manager') endpoint = '/user/staff/manager';
    else if (payload.role === 'Chef') endpoint = '/user/staff/chef';

    const response = await api.post(endpoint, body);
    return response.data?.data;
  } catch (err) {
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to create staff');
  }
};

/**
 * Update staff member
 */
export const updateStaff = async (id, payload) => {
  try {
    const restaurantId = getRestaurantId();
    if (!restaurantId) {
      throw new Error('No restaurant selected.');
    }
    
    await resolveTenantId(restaurantId);
    
    const body = {
      fullName: payload.name,
    };
    if (payload.avatar) body.avatar = payload.avatar;
    if (payload.password) body.password = payload.password;

    const response = await api.patch(`/user/${id}`, body);
    return response.data?.data;
  } catch (err) {
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to update staff');
  }
};

/**
 * Delete staff member
 */
export const deleteStaff = async (id) => {
  try {
    const restaurantId = getRestaurantId();
    if (!restaurantId) {
      throw new Error('No restaurant selected.');
    }
    
    await resolveTenantId(restaurantId);
    
    const response = await api.delete(`/user/${id}`);
    return response.data;
  } catch (err) {
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to delete staff');
  }
};

export default { getStaff, createStaff, updateStaff, deleteStaff };