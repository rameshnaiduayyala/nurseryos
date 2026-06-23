import { API_URL, getHeaders, handleResponse } from './base';

export const pos = {
  create: async (sale) => {
    const res = await fetch(`${API_URL}/pos-sales`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sale),
    });
    return handleResponse(res);
  },
  list: async () => {
    const res = await fetch(`${API_URL}/pos-sales`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  printUrl: (id) => `${API_URL}/pos-sales/${id}/print?token=${localStorage.getItem('token')}`,
};
