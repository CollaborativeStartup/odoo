import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/auth";

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const changePassword = async (oldPassword, newPassword) => {
  const response = await authApi.put("/change-password", {
    oldPassword,
    newPassword,
  });
  return response.data;
};

export default authApi;
