import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bankcare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bankcare_token');
      localStorage.removeItem('bankcare_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
