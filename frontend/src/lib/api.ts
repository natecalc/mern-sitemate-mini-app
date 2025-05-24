import API from "../config/apiClient";

export const login = async (data: { email: string; password: string }) =>
  API.post("/auth/login", data);

export const register = async (data: {
  email: string;
  password: string;
  confirmPassword: string;
}) => API.post("/auth/register", data);

export const verifyEmail = async (code: string) =>
  API.get(`/auth/email/verify/${code}`);
