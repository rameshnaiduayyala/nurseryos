import { API_URL, getHeaders, handleResponse } from './base';

export const procurement = {
  list: async () => {
    const res = await fetch(`${API_URL}/procurement`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (customerId, items) => {
    const res = await fetch(`${API_URL}/procurement`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ customerId, items }),
    });
    return handleResponse(res);
  },
};
