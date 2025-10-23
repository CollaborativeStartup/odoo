import axios from "axios";

const API_BASE_URL = "http://localhost:5000/categories";

const categoryApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
categoryApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getCategories = async () => {
  const response = await categoryApi.get("/getcategory");
  return response.data;
};

export default categoryApi;
