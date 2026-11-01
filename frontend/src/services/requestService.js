import api from "./api";

export const createRequest = (payload) => api.post("/requests", payload);
export const getRequests = (params) => api.get("/requests", { params });
export const getMyRequests = () => api.get("/requests/mine");
export const getRequestById = (id) => api.get(`/requests/${id}`);
export const cancelRequest = (id) => api.patch(`/requests/${id}/cancel`);
export const getResponses = (id) => api.get(`/requests/${id}/responses`);
export const respondToRequest = (id, payload) =>
  api.post(`/requests/${id}/respond`, payload);
export const selectDonor = (id, responseId) =>
  api.patch(`/requests/${id}/responses/${responseId}/select`);
export const searchDonors = (params) => api.get("/donors/search", { params });