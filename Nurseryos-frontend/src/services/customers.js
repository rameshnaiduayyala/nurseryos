import { API_URL, getHeaders, handleResponse } from './base';

export const customers = {
  list: async () => {
    const res = await fetch(`${API_URL}/customers`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (name, email, phone, address, type) => {
    const res = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, phone, address, type }),
    });
    return handleResponse(res);
  },
};
