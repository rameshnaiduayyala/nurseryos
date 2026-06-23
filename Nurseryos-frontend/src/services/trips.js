import { API_URL, getHeaders, handleResponse } from './base';

export const trips = {
  list: async () => {
    const res = await fetch(`${API_URL}/trips`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (trip) => {
    const res = await fetch(`${API_URL}/trips`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(trip),
    });
    return handleResponse(res);
  },
  updateStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/trips/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
  getTripById: async (id) => {
    const res = await fetch(`${API_URL}/trips/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
