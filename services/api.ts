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

  register: async (email: string, password: string, initialBalance: string, label: string): Promise<any> => {
    const res = await fetch(`${API_URL}/auth?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, initialBalance, label })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  updateUserProfile: async (initialBalance: number): Promise<{user: Partial<User>}> => {
    const res = await fetch(`${API_URL}/auth?action=update-profile`, {
        method: 'PUT',
        headers: ApiService.getHeaders(),
        body: JSON.stringify({ initialBalance })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mengupdate profil');
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

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
      const res = await fetch(`${API_URL}/auth?action=change-password`, {
          method: 'POST',
          headers: ApiService.getHeaders(),
          body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah kata sandi');
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
  
  adminActivateUser: async (token: string, userId: string) => {
      const res = await fetch(`${API_URL}/admin?action=activate`, {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
          body: JSON.stringify({ userId })
      });
      if (!res.ok) throw new Error('Gagal mengaktifkan user');
      return res.json();
  },

  adminUpdateUserLabel: async (token: string, userId: string, label: string) => {
      const res = await fetch(`${API_URL}/admin?action=update-label`, {
          method: 'PUT',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
          body: JSON.stringify({ userId, label })
      });
      if (!res.ok) throw new Error('Gagal update label');
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