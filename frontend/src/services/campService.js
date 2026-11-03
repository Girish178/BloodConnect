import api from "./api";

export const listCamps = (params) => api.get("/camps", { params });
export const getMyCamps = () => api.get("/camps/mine");
export const getManagedCamps = () => api.get("/camps/managed");
export const getCamp = (id) => api.get(`/camps/${id}`);
export const createCamp = (payload) => api.post("/camps", payload);
export const updateCamp = (id, payload) => api.put(`/camps/${id}`, payload);
export const cancelCamp = (id) => api.patch(`/camps/${id}/cancel`);
export const registerForCamp = (id) => api.post(`/camps/${id}/register`);
export const cancelRegistration = (id) => api.delete(`/camps/${id}/register`);
export const getAttendees = (id) => api.get(`/camps/${id}/attendees`);
export const markAttendance = (id, regId, attended) =>
  api.patch(`/camps/${id}/attendees/${regId}`, { attended });
