import { API_URL, getHeaders, handleResponse } from './base';

export const reservations = {
  list: async () => {
    const res = await fetch(`${API_URL}/reservations`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (plantId, quantity, expiresAt) => {
    const res = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ plantId, quantity, expiresAt }),
    });
    return handleResponse(res);
  },
  updateStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/reservations/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
};
