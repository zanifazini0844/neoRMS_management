import api from "@/services/api";

/**
 * Registers a new owner
 * @param {Object} data - { fullName, email, password }
 * @returns {Promise<Object>} - API response
 */
export const registerOwner = async ({ fullName, email, password }) => {
  const response = await api.post("/user/signup", {
    fullName,
    email,
    password,
    role: "OWNER", // enforce role to OWNER
  });

  return response.data;
};