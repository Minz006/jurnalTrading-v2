import React, { useState, useEffect, useMemo } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { TradeForm } from './components/TradeForm';
import { TradeTable } from './components/TradeTable';
import { Card } from './components/ui/Card';
import { ApiService } from './services/api'; // Use ApiService
import { StorageService } from './services/storage'; // Keep for user session check mostly
import { Trade, User, Statistics } from './types';
import { LayoutGrid, List, LogOut, Wallet, Menu, X, PlusCircle } from 'lucide-react';

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

  // Update stats whenever trades or user changes
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
      totalTrades,
      wins,
      losses,
      breakEven,
      winRate,
      currentBalance,
      totalProfit: totalProfitVal,
      maxDrawdown,
      profitFactor
    };
  }, [trades, user]);

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    StorageService.saveUser(loggedInUser); // Cache user info
    try {
      const apiTrades = await ApiService.getTrades();
      setTrades(apiTrades);
    } catch (e) {
      console.error(e);
    }
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
      // Remove ID as DB generates it
      const { id, ...payload } = tradeData; 
      const newTrade = await ApiService.addTrade(payload);
      setTrades([newTrade, ...trades]);
      alert('Trade berhasil disimpan ke Database!');
    } catch (e) {
      alert('Gagal menyimpan trade.');
      console.error(e);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    if (confirm('Apakah anda yakin ingin menghapus data trade ini?')) {
      try {
        await ApiService.deleteTrade(id);
        setTrades(trades.filter(t => t.id !== id));
      } catch (e) {
        alert('Gagal menghapus trade.');
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Memuat...</div>;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setActiveView(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition group ${
        activeView === view 
          ? 'bg-primary/10 text-primary' 
          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeView === view ? 'text-primary' : 'text-slate-500 group-hover:text-white'}`} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background text-slate-200 font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-surface/90 backdrop-blur border-b border-slate-700 z-40 flex items-center justify-between p-4 h-16">
        <div className="flex items-center space-x-2">
          <Wallet className="w-6 h-6 text-primary" />
          <div>
            <span className="font-bold text-white block leading-none">Jurnal Trading</span>
            <span className="text-[10px] text-slate-400 block leading-none mt-1">powered by minz</span>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-white">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-slate-700 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen md:sticky md:top-0
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3 mb-1">
            <div className="bg-primary/20 p-2 rounded-lg">
               <Wallet className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
              Jurnal Pro
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono pl-1">powered by minz</p>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem view="dashboard" icon={LayoutGrid} label="Dashboard" />
          <NavItem view="input" icon={PlusCircle} label="Input Trade" />
          <NavItem view="history" icon={List} label="Riwayat" />
        </nav>

        {/* User Info & Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/30">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate" title={user.email}>{user.email}</p>
              <p className="text-xs text-slate-400">Modal: ${user.initialBalance}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 text-slate-400 py-2 rounded-lg transition border border-slate-700 hover:border-rose-500/50"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 overflow-x-hidden w-full">
        <div className="max-w-6xl mx-auto">
          
          {/* View: Dashboard */}
          {activeView === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2 mb-6">
                <LayoutGrid className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Dashboard Statistik</h2>
              </div>
              <Dashboard stats={stats} trades={trades} user={user} />
            </div>
          )}

          {/* View: Input Trade */}
          {activeView === 'input' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2 mb-6">
                <PlusCircle className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Input Trade Baru</h2>
              </div>
              <Card className="border-t-4 border-t-primary">
                <TradeForm onAddTrade={handleAddTrade} />
              </Card>
            </div>
          )}

          {/* View: History */}
          {activeView === 'history' && (
             <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2 mb-6">
                <List className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Riwayat Trading</h2>
              </div>
              <Card className="p-0 overflow-hidden">
                <TradeTable trades={trades} user={user} onDelete={handleDeleteTrade} />
              </Card>
            </div>
          )}

          <footer className="border-t border-slate-800 pt-8 mt-12 text-center text-slate-500 text-sm pb-8">
            <p>&copy; {new Date().getFullYear()} Jurnal Trading Pro. Database Powered by Vercel Postgres.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;