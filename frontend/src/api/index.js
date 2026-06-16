import axios from 'axios';

const api = axios.create({
  baseURL: 'https://threed-printer-management.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const auditLogAPI = {
  getAll: (params) => api.get('/audit-logs', { params }),
  getById: (id) => api.get(`/audit-logs/${id}`),
};

export const printerAPI = {
  getAll: () => api.get('/printers'),
  getById: (id) => api.get(`/printers/${id}`),
  create: (data) => api.post('/printers', data),
  update: (id, data) => api.put(`/printers/${id}`, data),
  delete: (id) => api.delete(`/printers/${id}`),
};

export const repairAPI = {
  getAll: () => api.get('/repairs'),
  getById: (id) => api.get(`/repairs/${id}`),
  create: (data) => api.post('/repairs', data),
  update: (id, data) => api.put(`/repairs/${id}`, data),
  delete: (id) => api.delete(`/repairs/${id}`),
  startRepair: (id) => api.put(`/repairs/${id}/start`),
  completeRepair: (id) => api.put(`/repairs/${id}/complete`),
};

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
};

export const technicianAPI = {
  getAll: () => api.get('/technicians'),
  getById: (id) => api.get(`/technicians/${id}`),
  create: (data) => api.post('/technicians', data),
  update: (id, data) => api.put(`/technicians/${id}`, data),
  delete: (id) => api.delete(`/technicians/${id}`),
};

export const sparePartAPI = {
  getAll: (params) => api.get('/spare-parts', { params }),
  getById: (id) => api.get(`/spare-parts/${id}`),
  create: (data) => api.post('/spare-parts', data),
  update: (id, data) => api.put(`/spare-parts/${id}`, data),
  delete: (id) => api.delete(`/spare-parts/${id}`),
};

export const exportAPI = {
  getDashboard: () => api.get('/export/dashboard'),
  downloadPDF: (resource) =>
    api.get(`/export/pdf/${resource}`, { responseType: 'blob' }),

  downloadExcel: (resource) =>
    api.get(`/export/excel/${resource}`, { responseType: 'blob' }),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => {
    if (data instanceof FormData) {
      return api.put('/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.put('/settings', data);
  },
  deleteLogo: () => api.delete('/settings/logo'),
  changePassword: (data) => api.put('/settings/password', data),
  updateProfile: (data) => {
    if (data instanceof FormData) {
      return api.put('/settings/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.put('/settings/profile', data);
  },
  backup: () => api.get('/settings/backup', { responseType: 'blob' }),
  restore: (data) => api.post('/settings/restore', data),
};

export default api;