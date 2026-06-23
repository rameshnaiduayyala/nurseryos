import { API_URL, getHeaders, handleResponse } from './base';

export const collections = {
  collect: async (formData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/collections`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData, // binary multi-part content
    });
    return handleResponse(res);
  },
  updateStopStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/collections/stops/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
};
