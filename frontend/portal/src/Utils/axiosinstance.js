import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  },
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
},
  (error) => {
    return Promise.reject(error);
  }
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't redirect if it's a login attempt that failed
      if (!error.config.url.includes("/login")) {
        // localStorage.removeItem("accessToken");
        // localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } else if (error.response.status === 500) {
      console.log(error.response.data.message);
    } else if (error.code === "ECONNABORTED") {
      console.log("Request timed out, please try again later");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;