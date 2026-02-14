import React, { useState, useEffect, useMemo } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { TradeForm } from './components/TradeForm';
import { TradeTable } from './components/TradeTable';
import { Card } from './components/ui/Card';
import { ApiService } from './services/api';
import { StorageService } from './services/storage';
import { Trade, User, Statistics } from './types';
import { LayoutGrid, List, LogOut, Wallet, Menu, X, PlusCircle, Moon, Sun } from 'lucide-react';

type ViewState = 'dashboard' | 'input' | 'history';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewState>('dashboard');

  // Load User & Trades on Mount
  useEffect(() => {
    const init = async () => {
      const savedUser = StorageService.getUser();
      const token = ApiService.getToken();

      if (savedUser && savedUser.isLoggedIn && token) {
        setUser(savedUser);
        try {
          const apiTrades = await ApiService.getTrades();
          setTrades(apiTrades);
        } catch (error) {
          console.error("Session expired or fetch failed", error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  // Calculate Stats
  const stats: Statistics = useMemo(() => {
    if (!user) return {
      totalTrades: 0, wins: 0, losses: 0, breakEven: 0, winRate: 0,
      currentBalance: 0, totalProfit: 0, maxDrawdown: 0, profitFactor: 0
    };

    const totalTrades = trades.length;
    const wins = trades.filter(t => t.pnl > 0).length;
    const losses = trades.filter(t => t.pnl < 0).length;
    const breakEven = trades.filter(t => t.pnl === 0).length;
    
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    
    const totalProfitVal = trades.reduce((sum, t) => sum + t.pnl, 0);
    const currentBalance = user.initialBalance + totalProfitVal;

    // Calculate Profit Factor
    const grossProfit = trades.reduce((sum, t) => (t.pnl > 0 ? sum + t.pnl : sum), 0);
    const grossLoss = Math.abs(trades.reduce((sum, t) => (t.pnl < 0 ? sum + t.pnl : sum), 0));
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    // Calculate Max Drawdown
    let maxDrawdown = 0;
    let peakBalance = user.initialBalance;
    let runningBal = user.initialBalance;

    [...trades].reverse().forEach(t => {
      runningBal += t.pnl;
      if (runningBal > peakBalance) {
        peakBalance = runningBal;
      }
      const drawdown = ((peakBalance - runningBal) / peakBalance) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return {
      totalTrades, wins, losses, breakEven, winRate, currentBalance,
      totalProfit: totalProfitVal, maxDrawdown, profitFactor
    };
  }, [trades, user]);

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    StorageService.saveUser(loggedInUser);
    try {
      const apiTrades = await ApiService.getTrades();
      setTrades(apiTrades);
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    StorageService.clearSession();
    ApiService.clearToken();
    setUser(null);
    setTrades([]);
    setActiveView('dashboard');
  };

  const handleAddTrade = async (tradeData: Trade) => {
    try {
      const { id, ...payload } = tradeData; 
      const newTrade = await ApiService.addTrade(payload);
      setTrades([newTrade, ...trades]);
      alert('Trade berhasil disimpan!');
      setActiveView('dashboard'); // Redirect to dashboard after add
    } catch (e) {
      alert('Gagal menyimpan trade.');
    }
  };

  const handleDeleteTrade = async (id: string) => {
    if (confirm('Hapus data trade ini?')) {
      try {
        await ApiService.deleteTrade(id);
        setTrades(trades.filter(t => t.id !== id));
      } catch (e) { alert('Gagal menghapus.'); }
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center text-primary"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!user) return <Auth onLogin={handleLogin} />;

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setActiveView(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
        activeView === view 
          ? 'bg-primary text-white shadow-lg shadow-primary/30 transform scale-100' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeView === view ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 z-40 flex items-center justify-between p-4 h-16 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-primary to-blue-600 p-1.5 rounded-lg">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-lg">Jurnal Pro</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary transition">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-fade-in" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800
        transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen md:sticky md:top-0
      `}>
        {/* Sidebar Header */}
        <div className="p-8 pb-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-primary to-purple-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
               <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-none">Jurnal Pro</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">Trading Dashboard</p>
            </div>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <NavItem view="dashboard" icon={LayoutGrid} label="Dashboard" />
          <NavItem view="input" icon={PlusCircle} label="Input Trade" />
          <NavItem view="history" icon={List} label="Riwayat Trade" />
        </nav>

        {/* User Info & Footer */}
        <div className="p-4 m-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md">
              {user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate" title={user.email}>{user.email}</p>
              <p className="text-xs text-slate-500">Modal: ${user.initialBalance}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 py-2.5 rounded-lg transition-all border border-gray-200 dark:border-slate-600 hover:border-rose-200 dark:hover:border-rose-800 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 overflow-x-hidden w-full max-w-[1600px]">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section for View */}
          <div className="flex items-center justify-between mb-8 animate-fade-in-up">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                {activeView === 'dashboard' && 'Market Overview'}
                {activeView === 'input' && 'Entry Baru'}
                {activeView === 'history' && 'Jurnal Transaksi'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {activeView === 'dashboard' && 'Statistik performa trading anda secara realtime.'}
                {activeView === 'input' && 'Catat rencana dan hasil eksekusi trading anda.'}
                {activeView === 'history' && 'Daftar lengkap riwayat kemenangan dan kekalahan.'}
              </p>
            </div>
            {/* Theme Toggle Hint (Optional, system auto) */}
            <div className="hidden md:block text-xs text-slate-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-gray-200 dark:border-slate-800">
               Auto Theme
            </div>
          </div>
          
          {/* View Content */}
          <div className="animate-fade-in-up">
            {activeView === 'dashboard' && <Dashboard stats={stats} trades={trades} user={user} />}
            
            {activeView === 'input' && (
              <Card className="border-t-4 border-t-primary">
                <TradeForm onAddTrade={handleAddTrade} />
              </Card>
            )}

            {activeView === 'history' && (
              <Card className="p-0 overflow-hidden border-0 shadow-xl">
                <TradeTable trades={trades} user={user} onDelete={handleDeleteTrade} />
              </Card>
            )}
          </div>

          <footer className="mt-12 text-center text-slate-400 dark:text-slate-600 text-sm pb-8">
            <p>&copy; {new Date().getFullYear()} Jurnal Trading Pro. Crafted with ❤️ by Minz.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;