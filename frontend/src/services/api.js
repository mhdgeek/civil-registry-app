import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Certificats de naissance
export const birthCertificateAPI = {
  getAll: () => api.get('/certificates'),
  getById: (id) => api.get(`/certificates/${id}`),
  create: (data) => api.post('/certificates', data),
  update: (id, data) => api.put(`/certificates/${id}`, data),
  delete: (id) => api.delete(`/certificates/${id}`),
  search: (query) => api.get(`/certificates/search?query=${query}`),
  importCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/certificates/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Certificats de décès
export const deathCertificateAPI = {
  getAll: () => api.get('/death-certificates'),
  getById: (id) => api.get(`/death-certificates/${id}`),
  create: (data) => api.post('/death-certificates', data),
  update: (id, data) => api.put(`/death-certificates/${id}`, data),
  delete: (id) => api.delete(`/death-certificates/${id}`),
  search: (query) => api.get(`/death-certificates/search?query=${query}`),
  importCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/death-certificates/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Certificats de mariage
export const marriageCertificateAPI = {
  getAll: () => api.get('/marriage-certificates'),
  getById: (id) => api.get(`/marriage-certificates/${id}`),
  create: (data) => api.post('/marriage-certificates', data),
  update: (id, data) => api.put(`/marriage-certificates/${id}`, data),
  delete: (id) => api.delete(`/marriage-certificates/${id}`),
  search: (query) => api.get(`/marriage-certificates/search?query=${query}`),
  importCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/marriage-certificates/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Statistiques
export const statsAPI = {
  getStats: () => api.get('/stats'),
};

export default api;
