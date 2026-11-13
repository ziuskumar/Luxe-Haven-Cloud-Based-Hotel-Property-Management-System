import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

// Attach JWT token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("luxehaven_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid
      localStorage.removeItem("luxehaven_token");
      localStorage.removeItem("luxehaven_user");
    }
    return Promise.reject(error);
  }
);

export default API;
