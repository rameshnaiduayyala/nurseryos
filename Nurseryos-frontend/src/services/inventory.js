import { API_URL, getHeaders, handleResponse } from './base';

export const inventory = {
  list: async () => {
    const res = await fetch(`${API_URL}/inventory`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (nurseryBlockId, plantId, quantity, unitPrice) => {
    const res = await fetch(`${API_URL}/inventory`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nurseryBlockId, plantId, quantity, unitPrice }),
    });
    return handleResponse(res);
  },
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  getTransactions: async (id) => {
    const res = await fetch(`${API_URL}/inventory/${id}/transactions`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const nurseryBlocks = {
  list: async () => {
    const res = await fetch(`${API_URL}/nursery-blocks`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (name, nurseryId) => {
    const res = await fetch(`${API_URL}/nursery-blocks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, nurseryId }),
    });
    return handleResponse(res);
  },
};
