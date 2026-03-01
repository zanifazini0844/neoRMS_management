import api from "@/services/api";

export const fetchUserProfile = async () => {
    const response = await api.get("/user/me");
    const data = response.data?.data;
    return data;
};

export const fetchRestaurantInfo = async () => {
    const response = await api.get("/restaurant/my-restaurants");
    const data = response.data?.data;
    return Array.isArray(data) ? data[0] : data;
};