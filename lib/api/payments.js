'use client';

import { apiRequest } from './client';

export const paymentsApi = {
  getByBooking: async (bookingId) => {
    return apiRequest(`/api/payments/${bookingId}`);
  },

  create: async (bookingId, data) => {
    return apiRequest(`/api/payments/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiRequest(`/api/payments/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiRequest(`/api/payments/delete/${id}`, {
      method: 'DELETE',
    });
  },

  sendEmail: async (paymentId, template) => {
    return apiRequest(`/api/payments/send-email/${paymentId}`, {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },

  getReports: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/payments/reports/summary${query ? `?${query}` : ''}`);
  },
};
