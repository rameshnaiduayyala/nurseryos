import { API_URL, getHeaders, handleResponse } from './base';

export const approvalRequests = {
  list: async (entityType) => {
    const queryParams = new URLSearchParams(entityType ? { entityType } : {}).toString();
    const res = await fetch(`${API_URL}/approval-requests?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (data) => {
    const res = await fetch(`${API_URL}/approval-requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  getById: async (id) => {
    const res = await fetch(`${API_URL}/approval-requests/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  review: async (id, status, reviewNote) => {
    const res = await fetch(`${API_URL}/approval-requests/${id}/review`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, reviewNote }),
    });
    return handleResponse(res);
  },
};
