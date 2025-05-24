import axios from "axios";

const options = {
  baseUrl: import.meta.env.VITE_API_URL,
  withCredentials: true,
};

// returns axios client
const API = axios.create(options);

// allow us to modify response from api if needed
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { status, data } = error.response;
    return Promise.reject({
      status,
      ...data,
    });
  }
);

export default API;
