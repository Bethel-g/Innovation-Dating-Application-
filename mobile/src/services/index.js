import { api } from './api.js';

const unwrap = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.posts)) return res.posts;
  if (Array.isArray(res.users)) return res.users;
  return [];
};

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  nearby: (params) => api.get('/users/nearby', params),
  profile: (id) => api.get(`/users/profile/${id || ''}`),
};

export const matches = {
  potential: () => api.get('/matches/potential'),
  list: () => api.get('/matches'),
  swipe: (targetUserId, action) => api.post('/matches/swipe', { targetUserId, action }),
  healthSector: () => api.get('/matches/health-sector'),
};

export const feed = {
  all: (params) => api.get('/feed/feed', params),
  create: (data) => api.post('/feed', data),
  like: (id) => api.post(`/feed/${id}/like`),
  comments: (postId) => api.get(`/feed/${postId}/comments`),
  addComment: (postId, data) => api.post(`/feed/${postId}/comments`, data),
};

export const chat = {
  conversations: () => api.get('/chat/conversations'),
  messages: (matchId) => api.get(`/chat/messages/${matchId}`),
  send: (data) => api.post('/chat/messages', data),
};

export const jobs = {
  all: (params) => api.get('/jobs', params),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  save: (id) => api.post(`/jobs/${id}/save`),
};

export const events = {
  all: (params) => api.get('/events', params),
  register: (id) => api.post(`/events/${id}/register`),
};

export const ideas = {
  all: (params) => api.get('/ideas', params),
  join: (id, data) => api.post(`/ideas/${id}/join`, data),
  addComment: (id, data) => api.post(`/ideas/${id}/comments`, data),
};

export const mentors = {
  all: (params) => api.get('/mentors', params),
  book: (data) => api.post('/mentors/book', data),
};

export { unwrap };