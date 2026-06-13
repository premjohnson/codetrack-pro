import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format success payloads and centralize error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error.response?.data);
    
    let message = 'Something went wrong';
    if (error.response?.data) {
      const data = error.response.data;
      if (data.errors && data.errors.length > 0) {
        message = data.errors.map(e => e.message).join(', ');
      } else if (data.message) {
        message = data.message;
      }
    }
    
    error.message = message;
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
