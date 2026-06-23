import { API_URL, getHeaders, handleResponse } from './base';

export const vehicles = {
  list: async () => {
    const res = await fetch(`${API_URL}/vehicles`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (licensePlate, model, capacity) => {
    const res = await fetch(`${API_URL}/vehicles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ licensePlate, model, capacity: parseInt(capacity) }),
    });
    return handleResponse(res);
  },
};
