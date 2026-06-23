import { API_URL, getHeaders, handleResponse } from './base';

export const plans = {
  list: async () => {
    const res = await fetch(`${API_URL}/plans`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (data) => {
    const res = await fetch(`${API_URL}/plans`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  getById: async (id) => {
    const res = await fetch(`${API_URL}/plans/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  downloadPdf: async (id) => {
    const res = await fetch(`${API_URL}/plans/${id}/pdf`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to download route sheet');
    }
    return res.blob();
  },
  updateStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/plans/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
  updateStopStatus: async (planId, stopId, status) => {
    const res = await fetch(`${API_URL}/plans/${planId}/stops/${stopId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
  getAvailability: async (id) => {
    const res = await fetch(`${API_URL}/plans/${id}/availability`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
