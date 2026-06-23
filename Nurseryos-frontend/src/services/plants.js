import { API_URL, getHeaders, handleResponse } from './base';

export const plants = {
  list: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/plants?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (plant) => {
    const res = await fetch(`${API_URL}/plants`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(plant),
    });
    return handleResponse(res);
  },
};

export const categories = {
  list: async () => {
    const res = await fetch(`${API_URL}/plant-categories`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (name) => {
    const res = await fetch(`${API_URL}/plant-categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/plant-categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const varieties = {
  list: async () => {
    const res = await fetch(`${API_URL}/plant-varieties`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (name, categoryId) => {
    const res = await fetch(`${API_URL}/plant-varieties`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, categoryId }),
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/plant-varieties/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const bagSizes = {
  list: async () => {
    const res = await fetch(`${API_URL}/bag-sizes`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (size) => {
    const res = await fetch(`${API_URL}/bag-sizes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ size }),
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/bag-sizes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const heights = {
  list: async () => {
    const res = await fetch(`${API_URL}/height-standards`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  create: async (name) => {
    const res = await fetch(`${API_URL}/height-standards`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/height-standards/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
