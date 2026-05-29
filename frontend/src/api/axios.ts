import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    const cleanToken = token.replace(/['"]+/g, '');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

export default api;