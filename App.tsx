import React, { useState, useEffect, useMemo } from 'react';
import { Auth } from './components/Auth';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { TradeForm } from './components/TradeForm';
import { TradeTable } from './components/TradeTable';
import { ChangePasswordForm } from './components/ChangePasswordForm';
import { AdminPanel } from './components/AdminPanel';
import { PsychologyTest } from './components/PsychologyTest'; // Import Component
import { Card } from './components/ui/Card';
import { ApiService } from './services/api';
import { StorageService } from './services/storage';
import { Trade, User, Statistics } from './types';
import { LayoutGrid, List, LogOut, Wallet, Menu, X, PlusCircle, Trash2, Settings, Lock } from 'lucide-react';

type ViewState = 'dashboard' | 'input' | 'history' | 'settings';
type AuthView = 'LANDING' | 'LOGIN' | 'REGISTER' | 'PSYCHOLOGY';

const App: React.FC = () => {
  // Simple Router Logic
  const pathname = window.location.pathname;
  if (pathname === '/admin') {
    return <AdminPanel />;
  }

  const [user, setUser] = useState<User | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  
  // State for Unauthenticated View
  const [authView, setAuthView] = useState<AuthView>('LANDING');

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
    setAuthView('LANDING'); // Reset to landing page on logout
  };

  const handleDeleteAccount = async () => {
      const confirmDelete = confirm("APAKAH ANDA YAKIN? Akun dan semua jurnal akan dihapus permanen. Email bisa digunakan kembali.");
      if (confirmDelete) {
          const secondConfirm = confirm("Tindakan ini tidak bisa dibatalkan.");
          if (secondConfirm) {
              try {
                  await ApiService.deleteAccount();
                  handleLogout();
                  alert("Akun berhasil dihapus.");
              } catch (e) {
                  alert("Gagal menghapus akun.");
              }
          }
      }
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

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center text-primary"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  // Unauthenticated State Handling
  if (!user) {
    if (authView === 'LANDING') {
      return <LandingPage onNavigate={(mode) => setAuthView(mode)} />;
    }
    if (authView === 'PSYCHOLOGY') {
        return <PsychologyTest onBack={() => setAuthView('LANDING')} onRegister={() => setAuthView('REGISTER')} />;
    }
    return (
        <Auth 
            onLogin={handleLogin} 
            initialMode={authView === 'REGISTER' ? 'REGISTER' : 'LOGIN'}
            onBack={() => setAuthView('LANDING')}
        />
    );
  }

  // Authenticated User UI (Dashboard)
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setActiveView(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
        activeView === view 
          ? 'bg-primary text-white shadow-lg shadow-primary/30 transform scale-100' 
          : 'text-slate-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeView === view ? 'text-white' : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black font-sans transition-colors duration-300">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 z-40 flex items-center justify-between p-4 h-16 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-primary to-blue-600 p-1.5 rounded-lg">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-lg">Jurnal Pro</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 dark:text-zinc-400 hover:text-primary transition">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-black border-r border-gray-200 dark:border-zinc-800
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
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 font-medium">Trading Dashboard</p>
            </div>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <NavItem view="dashboard" icon={LayoutGrid} label="Dashboard" />
          <NavItem view="input" icon={PlusCircle} label="Input Trade" />
          <NavItem view="history" icon={List} label="Riwayat Trade" />
          <NavItem view="settings" icon={Settings} label="Pengaturan" />
        </nav>

        {/* User Info & Footer */}
        <div className="p-4 m-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center space-x-3 mb-4">
            {/* Modified Profile Picture: Solid Color */}
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 font-bold shadow-sm">
              {user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate" title={user.email}>{user.email}</p>
              {/* Added User Label */}
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[10px] font-semibold text-primary bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md uppercase tracking-wide">
                  {user.label || 'TRADER'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 py-2 rounded-lg transition-all border border-gray-200 dark:border-zinc-700 shadow-sm text-xs font-medium"
            >
                <LogOut className="w-3 h-3" />
                <span>Keluar</span>
            </button>
            <button 
                onClick={handleDeleteAccount}
                className="w-full flex items-center justify-center space-x-2 text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 py-1.5 rounded-lg transition-all text-xs opacity-70 hover:opacity-100"
            >
                <Trash2 className="w-3 h-3" />
                <span>Hapus Akun</span>
            </button>
          </div>
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
                {activeView === 'settings' && 'Pengaturan Akun'}
              </h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
                {activeView === 'dashboard' && 'Statistik performa trading anda secara realtime.'}
                {activeView === 'input' && 'Catat rencana dan hasil eksekusi trading anda.'}
                {activeView === 'history' && 'Daftar lengkap riwayat kemenangan dan kekalahan.'}
                {activeView === 'settings' && 'Kelola keamanan dan preferensi akun anda.'}
              </p>
            </div>
            {/* Theme Toggle Hint (Optional, system auto) */}
            <div className="hidden md:block text-xs text-slate-400 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-gray-200 dark:border-zinc-800">
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

            {activeView === 'settings' && (
              <Card className="max-w-2xl mx-auto" title="Ubah Kata Sandi">
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg mb-6 flex items-start gap-3 border border-blue-100 dark:border-blue-900/30">
                      <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                          <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">Keamanan Akun</h4>
                          <p className="text-xs text-blue-700 dark:text-blue-400">
                              Jika Anda baru saja mereset kata sandi melalui Admin (Default: 123456), disarankan untuk segera mengubahnya demi keamanan akun Anda.
                          </p>
                      </div>
                  </div>
                  <ChangePasswordForm />
              </Card>
            )}
          </div>

          <footer className="mt-12 text-center text-slate-400 dark:text-zinc-600 text-sm pb-8">
            <p>&copy; {new Date().getFullYear()} Jurnal Trading Pro. Made by Minz.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;