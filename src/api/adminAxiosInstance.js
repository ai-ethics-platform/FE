import axios from "axios";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://dilemmai-idl.com"
).replace(/\/+$/, "");

const adminAxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

adminAxiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem(
      "admin_access_token"
    );

    if (accessToken) {
      const tokenType =
        sessionStorage.getItem("admin_token_type") ||
        "Bearer";

      config.headers = config.headers || {};
      config.headers.Authorization =
        `${tokenType} ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export function saveAdminSession(data) {
  if (data?.access_token) {
    sessionStorage.setItem(
      "admin_access_token",
      data.access_token
    );
  }

  if (data?.refresh_token) {
    sessionStorage.setItem(
      "admin_refresh_token",
      data.refresh_token
    );
  }

  sessionStorage.setItem(
    "admin_token_type",
    data?.token_type || "Bearer"
  );
  sessionStorage.setItem("adminLoggedIn", "true");
}

export function clearAdminSession() {
  sessionStorage.removeItem("admin_access_token");
  sessionStorage.removeItem("admin_refresh_token");
  sessionStorage.removeItem("admin_token_type");
  sessionStorage.removeItem("adminLoggedIn");
}

export default adminAxiosInstance;
