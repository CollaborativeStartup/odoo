import axios from "axios";

const API_BASE_URL = "http://localhost:5000/expenses";

const employeeApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
employeeApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getEmployeeExpenses = async () => {
  const response = await employeeApi.get("/employee");
  return response.data;
};

export const createExpense = async (expenseData) => {
  const response = await employeeApi.post("/create", expenseData);
  return response.data;
};

export const updateExpenseStatus = async (id, statusData) => {
  const response = await employeeApi.patch(`/${id}/status`, statusData);
  return response.data;
};

export default employeeApi;
