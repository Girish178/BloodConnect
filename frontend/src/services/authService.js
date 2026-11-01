import api from "./api";

export const registerRequest = (payload) => api.post("/auth/register", payload);
export const loginRequest = (payload) => api.post("/auth/login", payload);
export const getMe = () => api.get("/auth/me");
export const updateProfile = (payload) => api.put("/users/profile", payload);
export const setAvailability = (isAvailable) =>
  api.patch("/users/availability", { isAvailable });