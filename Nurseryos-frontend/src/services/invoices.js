import { API_URL, getHeaders, handleResponse } from './base';

export const invoices = {
  list: async () => {
    const res = await fetch(`${API_URL}/invoices`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
