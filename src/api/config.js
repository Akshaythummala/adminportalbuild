import axios from 'axios';

const BASE_URL = 'http://pragva.in:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  login: '/token',
  locations: '/data_locations',
  bins: '/data_bins',
  users: '/data_users',
  inventory: '/data_inventory',
  items: '/data_items',
  salesOrders: '/data_sales_orders',
  binCountRecords: '/bin-count-records',
  wmsAiUsers: '/wms-ai-users',
}; 