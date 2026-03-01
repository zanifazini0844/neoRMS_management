import api from "@/services/api";

export const fetchOwnerRestaurants = async () => {
    const response = await api.get("/restaurant/my-restaurants");
    return response.data?.data || [];
};

export const createRestaurant = async (data) => {
    const response = await api.post("/restaurant", data);
    return response.data?.data;
};

export const deleteRestaurant = async (id) => {
  const response = await api.delete(`/restaurant/${id}`);
  return response.data;
};