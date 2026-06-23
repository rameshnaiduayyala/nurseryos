import { API_URL, getHeaders, handleResponse } from './base';

export const drivers = {
  list: async () => {
    const res = await fetch(`${API_URL}/drivers`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (userId, licenseNumber) => {
    const res = await fetch(`${API_URL}/drivers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, licenseNumber }),
    });
    return handleResponse(res);
  },
};
