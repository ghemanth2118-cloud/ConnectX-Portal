import axios from 'axios';

const api = axios.create({
  baseURL: 'https://nexus-poi8.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
