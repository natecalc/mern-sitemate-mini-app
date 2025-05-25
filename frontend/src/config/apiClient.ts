import axios from "axios";
import queryClient from "./queryClient";
import { navigate } from "../lib/navigation";

const options = {
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
};

const TokenRefreshClient = axios.create(options);
TokenRefreshClient.interceptors.response.use((response) => response.data);

// returns axios client
const API = axios.create(options);

// allow us to modify response from api if needed
API.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { config, response } = error;
    const { status, data } = response || {};

    // try to refresh access token behind scenes
    if (status === 401 && data?.errorCode === "invalid_access_token") {
      try {
        await TokenRefreshClient.get("/auth/refresh");
        return TokenRefreshClient(config);
      } catch (error) {
        queryClient.clear();
        console.error("Failed to refresh access token", error);
        navigate("/login", {
          state: {
            redirectUrl: window.location.pathname,
          },
        });
      }
    }

    return Promise.reject({
      status,
      ...data,
    });
  }
);

export default API;
