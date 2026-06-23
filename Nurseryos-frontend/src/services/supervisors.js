import { API_URL, getHeaders, handleResponse } from './base';

export const supervisors = {
  list: async () => {
    const res = await fetch(`${API_URL}/supervisors`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (userId) => {
    const res = await fetch(`${API_URL}/supervisors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId }),
    });
    return handleResponse(res);
  },
};
