import axios from "axios";
import { BASE_URL } from "../config/urlconfig";

const API_BASE_URL = `${BASE_URL}/expenses`;

const managerApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
managerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getPendingExpenses = async () => {
  try {
    const response = await managerApi.get("/manager");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch pending expenses", error);
    throw error;
  }
};

export const approveExpense = async (id) => {
  try {
    const response = await managerApi.patch(`/${id}/status`, {
      status: "approved",
    });
    return response.data;
  } catch (error) {
    console.error("Failed to approve expense", error);
    throw error;
  }
};

export const rejectExpense = async (id) => {
  try {
    const response = await managerApi.patch(`/${id}/status`, {
      status: "rejected",
    });
    return response.data;
  } catch (error) {
    console.error("Failed to reject expense", error);
    throw error;
  }
};
