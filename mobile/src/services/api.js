import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const matchAPI = {
  getPotential: () => api.get('/matches/potential'),
  swipe: (data) => api.post('/matches/swipe', data),
  getMatches: () => api.get('/matches'),
};

export const userAPI = {
  report: (data) => api.post('/users/report', data),
};

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (matchId, page) => api.get(`/chat/messages/${matchId}`, { params: { page } }),
  sendMessage: (data) => api.post('/chat/messages', data),
};

export default api;
