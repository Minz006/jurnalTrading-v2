import { Trade, User } from '../types';

const STORAGE_KEY_TRADES = 'jurnal_trading_trades';
const STORAGE_KEY_USER = 'jurnal_trading_user';

// Simulasi database menggunakan LocalStorage agar tetap persisten di Vercel/Browser user
export const StorageService = {
  getTrades: (): Trade[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TRADES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading trades:', error);
      return [];
    }
  },

  saveTrades: (trades: Trade[]): void => {
    localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(trades));
  },

  addTrade: (trade: Trade): Trade[] => {
    const currentTrades = StorageService.getTrades();
    const updatedTrades = [trade, ...currentTrades];
    StorageService.saveTrades(updatedTrades);
    return updatedTrades;
  },

  deleteTrade: (id: string): Trade[] => {
    const currentTrades = StorageService.getTrades();
    const updatedTrades = currentTrades.filter(t => t.id !== id);
    StorageService.saveTrades(updatedTrades);
    return updatedTrades;
  },

  getUser: (): User | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  saveUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  },

  clearSession: (): void => {
    // Kita tidak menghapus data trade, hanya status login jika diperlukan
    const user = StorageService.getUser();
    if (user) {
      StorageService.saveUser({ ...user, isLoggedIn: false });
    }
  }
};