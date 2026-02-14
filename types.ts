export interface Trade {
  id: string;
  date: string;
  pair: string; // "Fair" / Pair
  type: 'BUY' | 'SELL';
  entryPrice?: number;
  exitPrice?: number;
  lot: number;
  pnl: number; // Profit or Loss absolute value
  notes?: string;
}

export interface User {
  email: string;
  initialBalance: number;
  isLoggedIn: boolean;
  label?: string; // e.g., "Trader Forex", "Investor Saham"
}

export interface Statistics {
  totalTrades: number;
  wins: number;
  losses: number;
  breakEven: number;
  winRate: number;
  currentBalance: number;
  totalProfit: number;
  maxDrawdown: number;
  profitFactor: number;
}