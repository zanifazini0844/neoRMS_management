/**
 * Auth Storage Service
 * Manages localStorage operations for authentication tokens and user data
 * Ensures consistency across owner and manager logins
 */

const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'authToken',
  USER_ROLE: 'authRole',
  USER_ROLE_LOWERCASE: 'role',
  USER_NAME: 'userName',
  TENANT_ID: 'tenantId',
  RESTAURANT_ID: 'restaurantId',
  OWNED_RESTAURANTS: 'ownedRestaurants',
  USER_PROFILE: 'userProfile', // Store full user object
  CURRENT_USER_ROLE: 'currentUserRole', // Track current user's role
};

/**
 * Store authentication credentials after successful login
 * @param {Object} loginResponse - { accessToken, user }
 */
export const storeAuthCredentials = (accessToken, user) => {
  if (!accessToken || !user) {
    console.error('[authStorage] Invalid login response:', { accessToken, user });
    throw new Error('Invalid login response');
  }

  try {
    // Store access token
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    
    // Store user role in multiple formats for compatibility
    const role = String(user.role).toLowerCase();
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_ROLE, user.role);
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_ROLE_LOWERCASE, role);
    localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER_ROLE, role);
    
    // Store user name
    if (user?.fullName || user?.name) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER_NAME, user.fullName || user.name);
    }
    
    // Store full user profile for reference
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    
    // Store tenant ID from user object
    if (user?.tenantId) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TENANT_ID, user.tenantId);
    }
    
    // Store restaurant ID from user object (if available)
    if (user?.restaurantId) {
      localStorage.setItem(AUTH_STORAGE_KEYS.RESTAURANT_ID, user.restaurantId);
    } else if (user?.restaurant?.id) {
      localStorage.setItem(AUTH_STORAGE_KEYS.RESTAURANT_ID, user.restaurant.id);
    }
    
    // Store tenant ID from alternate paths
    if (user?.restaurant?.tenantId) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TENANT_ID, user.restaurant.tenantId);
    }
    
    console.log('[authStorage] Credentials stored successfully:', {
      role,
      accessTokenSet: Boolean(accessToken),
      tenantId: localStorage.getItem(AUTH_STORAGE_KEYS.TENANT_ID),
      restaurantId: localStorage.getItem(AUTH_STORAGE_KEYS.RESTAURANT_ID),
    });
    
    return {
      accessToken,
      role,
      tenantId: localStorage.getItem(AUTH_STORAGE_KEYS.TENANT_ID),
      restaurantId: localStorage.getItem(AUTH_STORAGE_KEYS.RESTAURANT_ID),
    };
  } catch (error) {
    console.error('[authStorage] Error storing credentials:', error);
    throw error;
  }
};

/**
 * Get stored access token
 * @returns {string|null} The access token or null if not set
 */
export const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Get stored user role
 * @returns {string|null} The user role (lowercase) or null if not set
 */
export const getUserRole = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.USER_ROLE_LOWERCASE) || 
         localStorage.getItem(AUTH_STORAGE_KEYS.USER_ROLE)?.toLowerCase() || null;
};

/**
 * Get stored user name
 * @returns {string|null} The user's full name or null if not set
 */
export const getUserName = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.USER_NAME);
};

/**
 * Get stored user profile
 * @returns {Object|null} The complete user profile or null if not set
 */
export const getUserProfile = () => {
  if (typeof window === 'undefined') return null;
  try {
    const profile = localStorage.getItem(AUTH_STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.warn('[authStorage] Error parsing user profile:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if access token is stored
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN));
};

/**
 * Store owned restaurants (for owner role)
 * @param {Array} restaurants - Array of restaurant objects
 */
export const storeOwnedRestaurants = (restaurants) => {
  try {
    localStorage.setItem(
      AUTH_STORAGE_KEYS.OWNED_RESTAURANTS,
      JSON.stringify(Array.isArray(restaurants) ? restaurants : [])
    );
  } catch (error) {
    console.error('[authStorage] Error storing restaurants:', error);
  }
};

/**
 * Get owned restaurants
 * @returns {Array|null} Array of owned restaurants or null if not stored
 */
export const getOwnedRestaurants = () => {
  if (typeof window === 'undefined') return null;
  try {
    const restaurants = localStorage.getItem(AUTH_STORAGE_KEYS.OWNED_RESTAURANTS);
    return restaurants ? JSON.parse(restaurants) : null;
  } catch (error) {
    console.warn('[authStorage] Error parsing owned restaurants:', error);
    return null;
  }
};

/**
 * Clear all auth credentials (logout)
 */
export const clearAuthCredentials = () => {
  try {
    Object.values(AUTH_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('[authStorage] Auth credentials cleared successfully');
  } catch (error) {
    console.error('[authStorage] Error clearing credentials:', error);
  }
};

/**
 * Get tenant ID
 * @returns {string|null} The tenant ID or null if not set
 */
export const getTenantId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.TENANT_ID);
};

/**
 * Get restaurant ID
 * @returns {string|null} The restaurant ID or null if not set
 */
export const getRestaurantId = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.RESTAURANT_ID);
};

/**
 * Set restaurant ID
 * @param {string} restaurantId - The restaurant ID to store
 */
export const setRestaurantId = (restaurantId) => {
  if (restaurantId) {
    localStorage.setItem(AUTH_STORAGE_KEYS.RESTAURANT_ID, restaurantId);
  }
};

/**
 * Set tenant ID
 * @param {string} tenantId - The tenant ID to store
 */
export const setTenantId = (tenantId) => {
  if (tenantId) {
    localStorage.setItem(AUTH_STORAGE_KEYS.TENANT_ID, tenantId);
  }
};

/**
 * Get all stored auth data (for debugging)
 * @returns {Object} Object containing all stored auth data
 */
export const getAllAuthData = () => {
  if (typeof window === 'undefined') return {};
  return {
    accessToken: getAccessToken() ? 'SET' : 'NOT SET',
    role: getUserRole(),
    userName: getUserName(),
    tenantId: getTenantId(),
    restaurantId: getRestaurantId(),
    ownedRestaurants: getOwnedRestaurants()?.length || 0,
    isAuthenticated: isAuthenticated(),
  };
};
