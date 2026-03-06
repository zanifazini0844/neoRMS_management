import api from '@/services/api';

const BASE_URL = '/review/management/analyzer';

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
 * Fetch review analysis for a specific menu item.
 *
 * Backend route:
 * GET /review/management/analyzer/:menuId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 *
 * @param {string} menuId - Menu item ID to analyze.
 * @param {object} [options]
 * @param {string} [options.startDate] - Optional start date (YYYY-MM-DD).
 * @param {string} [options.endDate] - Optional end date (YYYY-MM-DD).
 * @returns {Promise<object>} Analyzer payload (response.data.data)
 */
export const getMenuReviewAnalysis = async (menuId, options = {}) => {
  try {
    if (!menuId) {
      throw new Error('Menu ID is required');
    }

    ensureHeaders();

    const params = {};
    if (options.startDate) params.startDate = options.startDate;
    if (options.endDate) params.endDate = options.endDate;

    const response = await api.get(`${BASE_URL}/${menuId}`, { params });

    return response.data?.data || {
      total_reviews: 0,
      kept_reviews: 0,
      ignored_reviews: 0,
      total_complaints: 0,
      complaints_grouped: [],
    };
  } catch (err) {
    console.error('[reviewapi] getMenuReviewAnalysis failed', err);
    throw new Error(
      err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch menu review analysis'
    );
  }
};

export default {
  getMenuReviewAnalysis,
};
