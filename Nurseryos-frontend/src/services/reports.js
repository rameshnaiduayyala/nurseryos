import { API_URL, getHeaders, handleResponse } from './base';

export const dashboard = {
  getStats: async () => {
    const res = await fetch(`${API_URL}/dashboard`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const reports = {
  getSummary: async () => {
    const res = await fetch(`${API_URL}/reports`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  getFarmerLedger: async () => {
    const res = await fetch(`${API_URL}/reports/farmer-ledger`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  getCustomerLedger: async () => {
    const res = await fetch(`${API_URL}/reports/customer-ledger`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
