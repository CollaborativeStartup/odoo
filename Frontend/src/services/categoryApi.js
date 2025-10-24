import axios from "axios";
import { BASE_URL } from "../config/urlconfig";
const API_BASE_URL = `${BASE_URL}/categories`;

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
