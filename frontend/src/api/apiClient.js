import axios from "axios";

// Resolve API Base URL from environment variables, stripping any trailing slash
const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.NEXT_PUBLIC_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : "");

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

export const getAuthToken = () => {
  try {
    const directToken =
      localStorage.getItem("token") || localStorage.getItem("access_token");
    if (directToken) return directToken;

    // Check redux-persist state if present
    const persistRoot = localStorage.getItem("persist:root");
    if (persistRoot) {
      const parsedRoot = JSON.parse(persistRoot);
      if (parsedRoot.user) {
        const userState = JSON.parse(parsedRoot.user);
        if (userState.currentUser?.token) {
          return userState.currentUser.token;
        }
      }
    }
  } catch (e) {
    // ignore localStorage parse errors
  }
  return null;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
};

// Create the single centralized Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor: attach token in Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("[API Client] Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor: handle token persistence and logging
apiClient.interceptors.response.use(
  (response) => {
    // If backend returns a token in the body, store it
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    return response;
  },
  (error) => {
    // Detailed error logging
    if (error.response) {
      console.error(
        `[API Client] Server responded with error [${error.response.status}]:`,
        error.response.data
      );
    } else if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
      console.error(
        `[API Client] Network failure: Unable to reach backend at ${API_BASE_URL || "origin"}. Check CORS / backend deployment.`,
        error
      );
    } else {
      console.error("[API Client] Request failed:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
