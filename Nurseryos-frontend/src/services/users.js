import { API_URL, getHeaders, handleResponse } from './base';

export const users = {
  list: async () => {
    const res = await fetch(`${API_URL}/users`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  approve: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}/approve`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  updateActiveStatus: async (id, isActive) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ isActive }),
    });
    return handleResponse(res);
  },
};
