import axios from "axios";

export const TOKEN_KEY = "bc_token";

const PROD_API = "https://bloodconnect-qmbc.onrender.com/api";

const api = axios.create({
  // local development uses your own computer; the live site uses Render
  baseURL: import.meta.env.DEV ? "http://localhost:5000/api" : PROD_API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getErrorMessage = (err) =>
  err.response?.data?.message || err.message || "Something went wrong";

export default api;