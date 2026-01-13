'use client';

import { apiRequest } from './client';

export const bookingsApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/bookings${query ? `?${query}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/api/bookings/${id}`);
  },

  create: async (data) => {
    return apiRequest('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiRequest(`/api/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/bookings/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async () => {
    return apiRequest('/api/bookings/stats');
  },

  importExcel: async (base64Data) => {
    return apiRequest('/api/bookings/import', {
      method: 'POST',
      body: JSON.stringify({ data: base64Data }),
    });
  },

  exportExcel: async () => {
    return apiRequest('/api/bookings/export', {
      responseType: 'blob',
    });
  },

  downloadTemplate: async () => {
    return apiRequest('/api/bookings/template', {
      responseType: 'blob',
    });
  },
};
