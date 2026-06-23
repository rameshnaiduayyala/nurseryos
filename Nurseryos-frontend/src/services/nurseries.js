import { API_URL, getHeaders, handleResponse } from './base';

export const nurseries = {
  list: async () => {
    const res = await fetch(`${API_URL}/nurseries`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (name, location, address, gst, contactPerson, latitude, longitude) => {
    const res = await fetch(`${API_URL}/nurseries`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name,
        location,
        address,
        gst,
        contactPerson,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      }),
    });
    return handleResponse(res);
  },
  approve: async (id, isApproved) => {
    const res = await fetch(`${API_URL}/nurseries/${id}/approve`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isApproved }),
    });
    return handleResponse(res);
  },
  nearby: async (lat, lng, radius) => {
    const res = await fetch(`${API_URL}/nurseries/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
