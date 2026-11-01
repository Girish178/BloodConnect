import api from "./api";

export const getPublicStats = () => api.get("/stats/public");