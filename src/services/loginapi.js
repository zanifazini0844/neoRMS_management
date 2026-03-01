import api from "@/services/api"; // your axios instance

export const loginManagement = async ({ email, password }) => {
  const response = await api.post("/auth/login/management", { email, password });
  const { accessToken, user } = response.data?.data ?? {};
  if (!accessToken || !user?.role) {
    throw new Error("Invalid response from server");
  }

  return { accessToken, user };
};