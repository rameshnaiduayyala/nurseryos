import { API_URL, getHeaders, handleResponse } from './base';

export const payments = {
  create: async (invoiceId, amount, paymentMethod, transactionReference) => {
    const res = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ invoiceId, amount: parseFloat(amount), paymentMethod, transactionReference }),
    });
    return handleResponse(res);
  },
};
