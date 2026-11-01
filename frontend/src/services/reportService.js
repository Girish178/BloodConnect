import api from "./api";

export const createReport = (payload) => api.post("/reports", payload);