import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? 'https://vt-agency.onrender.com/api' : '/api');

const API = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const imageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = import.meta.env.VITE_API_URL
    || (import.meta.env.PROD ? 'https://vt-agency.onrender.com' : '');
  return `${base}${path}`;
};

export const proxyImageUrl = (url) => {
  if (!url) return '';
  const base = API.defaults.baseURL || '/api';
  return `${base}/proxy-image?url=${encodeURIComponent(url)}`;
};

export default API;
