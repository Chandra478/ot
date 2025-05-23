import axios from 'axios';

// Create a function to properly get the API URL
const getApiBaseUrl = () => {
  return 'http://localhost:8000';
  // During development
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }
  // In production
  return process.env.REACT_APP_API_URL || 'https://api.yourdomain.com';
};

const instance = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;