import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const enrollmentApi = {
  create: (data) => api.post('/enrollments', data),
  getAll: () => api.get('/enrollments'),
  getStats: () => api.get('/enrollments/stats'),
};

export const contactApi = {
  create: (data) => api.post('/contacts', data),
  getAll: () => api.get('/contacts'),
};

export const coursesApi = {
  getAll: () => api.get('/courses'),
  getTechnical: () => api.get('/courses/technical'),
  getNonTechnical: () => api.get('/courses/nontechnical'),
};