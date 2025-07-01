import axios from 'axios';

// Base URL for my backend API
const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
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

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

// MindMap API functions
export const mindMapAPI = {
  // Create new mindmap
  create: async (mindMapData) => {
    try {
      const response = await api.post('/mindmaps', mindMapData);
      return response.data;
    } catch (error) {
      console.error('Error creating mindmap:', error);
      throw error;
    }
  },

  // Get specific mindmap by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/mindmaps/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mindmap:', error);
      throw error;
    }
  },

  // Update existing mindmap
  update: async (id, mindMapData) => {
    try {
      const response = await api.put(`/mindmaps/${id}`, mindMapData);
      return response.data;
    } catch (error) {
      console.error('Error updating mindmap:', error);
      throw error;
    }
  },

  // Get all user's mindmaps
  getUserMindMaps: async () => {
    try {
      const response = await api.get('/mindmaps');
      return response.data;
    } catch (error) {
      console.error('Error fetching user mindmaps:', error);
      throw error;
    }
  },
};

// Auth API functions (for login/register)
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default api;