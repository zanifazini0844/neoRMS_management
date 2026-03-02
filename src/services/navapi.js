import api from "@/services/api";

export const fetchUserProfile = async () => {
    const response = await api.get("/user/me");
    const data = response.data?.data;
    return data;
};

export const fetchRestaurantInfo = async () => {
    console.log('[navapi] fetchRestaurantInfo called');
    // always pull full list so we can pick the one currently selected
    const response = await api.get("/restaurant/my-restaurants");
    const restaurants = response.data?.data || [];
    console.log('[navapi] received restaurants', restaurants);

    // cache the list locally for quick lookup & historical reference
    try {
        localStorage.setItem('ownedRestaurants', JSON.stringify(restaurants));
    } catch {
        // ignore storage failures
    }

    // if an explicit restaurantId is stored, return that restaurant
    const currentId = typeof window !== 'undefined' ? localStorage.getItem('restaurantId') : null;
    console.log('[navapi] currentId from localStorage:', currentId);
    if (currentId && Array.isArray(restaurants)) {
        const found = restaurants.find((r) => String(r.id) === String(currentId));
        console.log('[navapi] found restaurant matching id:', found);
        if (found) {
            return found;
        }
    }

    // otherwise fall back to the first element (owner default)
    const fallback = Array.isArray(restaurants) ? restaurants[0] : restaurants;
    console.log('[navapi] fallback restaurant:', fallback);
    return fallback;
};