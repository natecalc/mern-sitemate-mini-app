import API from "../config/apiClient";

export const login = async (data: any) => API.post("/auth/login", data);
