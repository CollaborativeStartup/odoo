import axios from "axios";
import { BASE_URL } from "../config/urlconfig";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Users
export async function fetchUsers() {
  const res = await axios.get(`${BASE_URL}/users/allusers`, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function fetchUser(userId) {
  const res = await axios.get(`${BASE_URL}/users/${userId}`, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function createUser(payload) {
  const res = await axios.post(`${BASE_URL}/users/createuser`, payload, {
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  });
  return res.data;
}

export async function updateUser(userId, updates) {
  const res = await axios.put(
    `${BASE_URL}/users/updateuser/${userId}`,
    updates,
    {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    }
  );
  return res.data;
}

export async function sendPassword(userId) {
  const res = await axios.post(
    `${BASE_URL}/users/sendpassword/${userId}`,
    {},
    {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    }
  );
  return res.data;
}

// Categories
export async function fetchCategories() {
  const res = await axios.get(`${BASE_URL}/categories/getcategory`, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function createCategory(payload) {
  const res = await axios.post(`${BASE_URL}/categories/create`, payload, {
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  });
  return res.data;
}

export async function updateCategory(categoryId, updates) {
  const res = await axios.put(
    `${BASE_URL}/categories/update/${categoryId}`,
    updates,
    {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    }
  );
  return res.data;
}

// Approval Rules
export async function fetchApprovalRules() {
  const res = await axios.get(`${BASE_URL}/approvalrules/getrule`, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function createApprovalRule(payload) {
  const res = await axios.post(
    `${BASE_URL}/approvalrules/createrule`,
    payload,
    {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    }
  );
  return res.data;
}

export async function updateApprovalRule(ruleId, payload) {
  const res = await axios.put(
    `${BASE_URL}/approvalrules/updaterule/${ruleId}`,
    payload,
    {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    }
  );
  return res.data;
}
