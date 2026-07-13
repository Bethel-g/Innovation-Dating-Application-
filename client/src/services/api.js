import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  socialLogin: (data) => api.post('/auth/social-login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  getProfile: (id) => api.get(`/users/profile/${id}`),
  uploadPhotos: (formData) => api.post('/users/photos', formData),
  deletePhoto: (id) => api.delete(`/users/photos/${id}`),
  setPrimaryPhoto: (id) => api.put(`/users/photos/${id}/primary`),
  updatePreferences: (data) => api.put('/users/preferences', data),
  updateLocation: (data) => api.put('/users/location', data),
  completeOnboarding: () => api.put('/users/onboarding'),
  getNearby: () => api.get('/users/nearby'),
  deactivate: () => api.post('/users/deactivate'),
  report: (data) => api.post('/users/report', data),
};

export const matchAPI = {
  swipe: (data) => api.post('/matches/swipe', data),
  getMatches: () => api.get('/matches'),
  getPotential: () => api.get('/matches/potential'),
  getDaily: () => api.get('/matches/daily'),
  getHealthSector: () => api.get('/matches/health-sector'),
  getInsight: (id) => api.get(`/matches/insight/${id}`),
  block: (userId) => api.post('/matches/block', { targetUserId: userId }),
  getSwipeCount: () => api.get('/matches/swipe-count'),
};

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (matchId, page) => api.get(`/chat/messages/${matchId}`, { params: { page } }),
  sendMessage: (data) => api.post('/chat/messages', data),
  deleteMessage: (id) => api.delete(`/chat/messages/${id}`),
  markAsRead: (matchId) => api.put(`/chat/messages/${matchId}/read`),
  getIcebreaker: (matchId) => api.get(`/chat/icebreaker/${matchId}`),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export const subscriptionAPI = {
  getCurrent: () => api.get('/subscriptions/current'),
  getPlans: () => api.get('/subscriptions/plans'),
  getHistory: () => api.get('/subscriptions/history'),
  upgrade: (tier) => api.post('/subscriptions/upgrade', { tier }),
  cancel: () => api.post('/subscriptions/cancel'),
};

export const feedAPI = {
  createPost: (data) => api.post('/feed', data),
  getFeed: (params) => api.get('/feed/feed', { params }),
  getExplore: (params) => api.get('/feed/explore', { params }),
  getUserPosts: (userId) => api.get(`/feed/user/${userId || ''}`),
  updatePost: (id, data) => api.put(`/feed/${id}`, data),
  deletePost: (id) => api.delete(`/feed/${id}`),
  likePost: (id) => api.post(`/feed/${id}/like`),
  getComments: (postId) => api.get(`/feed/${postId}/comments`),
  addComment: (postId, data) => api.post(`/feed/${postId}/comments`, data),
  deleteComment: (commentId) => api.delete(`/feed/comments/${commentId}`),
  followUser: (userId) => api.post(`/feed/follow/${userId}`),
  getFollowers: (userId) => api.get(`/feed/follow/followers/${userId || ''}`),
  getFollowing: (userId) => api.get(`/feed/follow/following/${userId || ''}`),
  getFollowCounts: (userId) => api.get(`/feed/follow/counts/${userId || ''}`),
};

export const projectAPI = {
  create: (data) => api.post('/projects', data),
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  apply: (projectId, data) => api.post(`/projects/${projectId}/apply`, data),
  getCollaborators: (projectId) => api.get(`/projects/${projectId}/collaborators`),
  getPending: (projectId) => api.get(`/projects/${projectId}/pending`),
  approveMember: (memberId) => api.put(`/projects/members/${memberId}/approve`),
  rejectMember: (memberId) => api.put(`/projects/members/${memberId}/reject`),
  leave: (projectId) => api.post(`/projects/${projectId}/leave`),
};

export const communityAPI = {
  create: (data) => api.post('/communities', data),
  getAll: (params) => api.get('/communities', { params }),
  getMine: () => api.get('/communities/mine'),
  getById: (id) => api.get(`/communities/${id}`),
  update: (id, data) => api.put(`/communities/${id}`, data),
  join: (id) => api.post(`/communities/${id}/join`),
  leave: (id) => api.post(`/communities/${id}/leave`),
};

export const ideasAPI = {
  create: (data) => api.post('/ideas', data),
  getAll: (params) => api.get('/ideas', { params }),
  getById: (id) => api.get(`/ideas/${id}`),
  join: (id, data) => api.post(`/ideas/${id}/join`, data),
  update: (id, data) => api.put(`/ideas/${id}`, data),
  addComment: (id, data) => api.post(`/ideas/${id}/comments`, data),
};

export const mentorsAPI = {
  getAll: (params) => api.get('/mentors', { params }),
  getById: (id) => api.get(`/mentors/${id}`),
  bookSession: (data) => api.post('/mentors/book', data),
  getSessions: () => api.get('/mentors/sessions'),
};

export const skillsAPI = {
  endorse: (userId, skill) => api.post(`/skills/endorse/${userId}`, { skill }),
  getEndorsements: (userId) => api.get(`/skills/endorsements/${userId}`),
  addSkill: (data) => api.post('/skills', data),
  removeSkill: (skill) => api.delete(`/skills/${skill}`),
};

export default api;
