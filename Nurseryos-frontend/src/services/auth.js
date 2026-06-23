import { API_URL, getHeaders, handleResponse } from './base';

export const auth = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },
  register: async (email, password, fullName, roleName) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, roleName }),
    });
    return handleResponse(res);
  },
  me: async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
