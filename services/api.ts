import { Trade, User } from '../types';

const API_URL = '/api';

export const ApiService = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token: string) => localStorage.setItem('token', token),
  clearToken: () => localStorage.removeItem('token'),

  getHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ApiService.getToken()}`
  }),

  // Auth
  login: async (email: string, password: string): Promise<{user: User, token: string}> => {
    const res = await fetch(`${API_URL}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  register: async (email: string, password: string, initialBalance: string, label: string): Promise<{user: User, token: string}> => {
    const res = await fetch(`${API_URL}/auth?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, initialBalance, label })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    const res = await fetch(`${API_URL}/auth?action=forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to request reset');
  },

  deleteAccount: async (): Promise<void> => {
      const res = await fetch(`${API_URL}/auth?action=delete-account`, {
          method: 'DELETE',
          headers: ApiService.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete account');
  },

  // Trades
  getTrades: async (): Promise<Trade[]> => {
    const res = await fetch(`${API_URL}/trades`, {
      headers: ApiService.getHeaders()
    });
    if (!res.ok) {
        if (res.status === 401) {
            ApiService.clearToken();
            throw new Error('Unauthorized');
        }
        return [];
    }
    return res.json();
  },

  addTrade: async (trade: Partial<Trade>): Promise<Trade> => {
    const res = await fetch(`${API_URL}/trades`, {
      method: 'POST',
      headers: ApiService.getHeaders(),
      body: JSON.stringify(trade)
    });
    if (!res.ok) throw new Error('Failed to add trade');
    return res.json();
  },

  deleteTrade: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/trades?id=${id}`, {
      method: 'DELETE',
      headers: ApiService.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete trade');
  },

  // Admin
  adminLogin: async (password: string) => {
    const res = await fetch(`${API_URL}/admin?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login admin gagal');
    return data;
  },

  adminGetUsers: async (token: string) => {
      const res = await fetch(`${API_URL}/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
  },

  adminResetPassword: async (token: string, userId: string) => {
      const res = await fetch(`${API_URL}/admin?action=reset`, {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
          body: JSON.stringify({ userId })
      });
      return res.json();
  },

  adminDeleteUser: async (token: string, userId: string) => {
      const res = await fetch(`${API_URL}/admin?action=delete&id=${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal menghapus user');
  }
};