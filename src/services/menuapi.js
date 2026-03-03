// menuapi.js
import api from '@/services/api';

const BASE_URL = '/menuProduct';

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
 * Create a new menu product
 * POST /menuProduct/{{restaurantId}}
 */
export const createMenuProduct = async (productData) => {
  try {
    const restaurantId = getRestaurantId();
    
    if (!restaurantId) {
      throw new Error('Restaurant ID not found. Please ensure you are logged in and have selected a restaurant.');
    }

    ensureHeaders();
    
    const url = `${BASE_URL}/${restaurantId}`;
    console.log('[createMenuProduct] Request URL:', url);
    console.log('[createMenuProduct] Payload:', productData);
    
    const response = await api.post(url, productData);
    console.log('[createMenuProduct] Success response:', response.data);
    
    return response.data?.data || response.data;
  } catch (err) {
    console.error('[createMenuProduct] Failed to create menu product:', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to create menu product');
  }
};

/**
 * Get all menu products for a restaurant
 * GET /menuProduct/{{restaurantId}}
 */
export const getMenuProductsByRestaurant = async () => {
  try {
    const restaurantId = getRestaurantId();
    
    if (!restaurantId) {
      throw new Error('Restaurant ID not found. Please ensure you are logged in and have selected a restaurant.');
    }

    ensureHeaders();
    
    const url = `${BASE_URL}/${restaurantId}`;
    console.log('[getMenuProductsByRestaurant] Request URL:', url);
    
    const response = await api.get(url);
    console.log('[getMenuProductsByRestaurant] Success response:', response.data);
    
    return response.data?.data || [];
  } catch (err) {
    console.error('[getMenuProductsByRestaurant] Failed to fetch menu products:', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to fetch menu products');
  }
};

/**
 * Get a specific menu product by ID
 * GET /menuProduct/{{restaurantId}}/{{menuProductId}}
 */
export const getMenuProductById = async (menuProductId) => {
  try {
    const restaurantId = getRestaurantId();
    
    if (!restaurantId) {
      throw new Error('Restaurant ID not found. Please ensure you are logged in and have selected a restaurant.');
    }

    if (!menuProductId) {
      throw new Error('Menu Product ID is required');
    }

    ensureHeaders();
    
    const url = `${BASE_URL}/${restaurantId}/${menuProductId}`;
    console.log('[getMenuProductById] Request URL:', url);
    
    const response = await api.get(url);
    console.log('[getMenuProductById] Success response:', response.data);
    
    return response.data?.data || response.data;
  } catch (err) {
    console.error('[getMenuProductById] Failed to fetch menu product:', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to fetch menu product');
  }
};

/**
 * Update an existing menu product
 * PATCH /menuProduct/{{restaurantId}}/{{menuProductId}}
 */
export const updateMenuProduct = async (menuProductId, productData) => {
  try {
    const restaurantId = getRestaurantId();
    
    if (!restaurantId) {
      throw new Error('Restaurant ID not found. Please ensure you are logged in and have selected a restaurant.');
    }

    if (!menuProductId) {
      throw new Error('Menu Product ID is required');
    }

    ensureHeaders();
    
    // Extract only scalar fields for update - Prisma doesn't accept nested objects directly
    const updatePayload = {
      productTitle: productData.productTitle,
      productDescription: productData.productDescription,
      estimatedCookingTime: productData.estimatedCookingTime,
      status: productData.status,
      priceCurrency: productData.priceCurrency,
      category: productData.category,
      dietaryTags: productData.dietaryTags,
      images: productData.images,
    };

    const url = `${BASE_URL}/${restaurantId}/${menuProductId}`;
    console.log('[updateMenuProduct] Request URL:', url);
    console.log('[updateMenuProduct] Payload:', updatePayload);
    
    const response = await api.patch(url, updatePayload);
    console.log('[updateMenuProduct] Success response:', response.data);
    
    return response.data?.data || response.data;
  } catch (err) {
    console.error('[updateMenuProduct] Failed to update menu product:', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to update menu product');
  }
};

/**
 * Delete a menu product
 * DELETE /menuProduct/{{restaurantId}}/{{menuProductId}}
 */
export const deleteMenuProduct = async (menuProductId) => {
  try {
    const restaurantId = getRestaurantId();
    
    if (!restaurantId) {
      throw new Error('Restaurant ID not found. Please ensure you are logged in and have selected a restaurant.');
    }

    if (!menuProductId) {
      throw new Error('Menu Product ID is required');
    }

    ensureHeaders();
    
    const url = `${BASE_URL}/${restaurantId}/${menuProductId}`;
    console.log('[deleteMenuProduct] Request URL:', url);
    
    const response = await api.delete(url);
    console.log('[deleteMenuProduct] Success response:', response.data);
    
    return response.data?.data || response.data;
  } catch (err) {
    console.error('[deleteMenuProduct] Failed to delete menu product:', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to delete menu product');
  }
};
