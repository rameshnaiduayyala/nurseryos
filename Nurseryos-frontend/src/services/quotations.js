import { API_URL, getHeaders, handleResponse } from './base';

export const quotations = {
  list: async () => {
    const res = await fetch(`${API_URL}/quotations`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (customerId, totalAmount, expiresAt) => {
    const res = await fetch(`${API_URL}/quotations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ customerId, totalAmount: parseFloat(totalAmount), expiresAt }),
    });
    return handleResponse(res);
  },
};
