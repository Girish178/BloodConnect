import api from "./api";

export const listUsers = (params) => api.get("/admin/users", { params });
export const setUserRole = (id, payload) =>
  api.patch(`/admin/users/${id}/role`, payload);
export const getOverview = () => api.get("/admin/overview");
export const listReports = (params) => api.get("/admin/reports", { params });
export const resolveReport = (id, action) =>
  api.patch(`/admin/reports/${id}`, { action });