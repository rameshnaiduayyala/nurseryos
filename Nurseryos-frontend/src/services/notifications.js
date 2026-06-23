import { API_URL, getHeaders, handleResponse } from './base';

export const notifications = {
  list: async (read) => {
    const queryParams = new URLSearchParams(read !== undefined ? { read } : {}).toString();
    const res = await fetch(`${API_URL}/notifications?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  unreadCount: async () => {
    const res = await fetch(`${API_URL}/notifications/unread-count`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  markAsRead: async (id) => {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  markAllAsRead: async () => {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
