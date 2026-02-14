import React from 'react';
import { TrendingUp, Shield, BarChart3, ChevronRight, Zap } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (mode: 'LOGIN' | 'REGISTER') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-slate-800 dark:text-zinc-200 flex flex-col font-sans selection:bg-primary selection:text-white overflow-hidden relative">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Jurnal Trading Pro</span>
        </div>
        <div>
          <button 
            onClick={() => onNavigate('LOGIN')}
            className="text-sm font-semibold text-slate-600 dark:text-zinc-400 hover:text-primary dark:hover:text-white transition-colors mr-6"
          >
            Masuk
          </button>
          <button 
            onClick={() => onNavigate('REGISTER')}
            className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm font-bold px-5 py-2.5 rounded-full border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
          >
            Daftar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 mt-10 mb-20">
        <div className="animate-fade-in-up max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-full px-3 py-1 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 tracking-wide uppercase">Platform Jurnal #1</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-slate-900 dark:text-white">
            Catat. Analisa. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600">
              Profit Konsisten.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Tingkatkan performa trading Anda dengan mencatat setiap eksekusi. 
            Analisis statistik winrate, drawdown, dan profit factor secara realtime.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate('REGISTER')}
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Mulai Sekarang <ChevronRight className="w-5 h-5" />
            </button>
            <button 
               onClick={() => onNavigate('LOGIN')}
               className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 text-slate-700 dark:text-zinc-300 rounded-xl font-bold text-lg transition-all"
            >
              Login Akun
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <FeatureCard 
            icon={BarChart3} 
            title="Analisis Statistik" 
            desc="Visualisasi data equity curve dan winrate otomatis." 
          />
          <FeatureCard 
            icon={Shield} 
            title="Data Aman" 
            desc="Sistem keamanan terenkripsi dan verifikasi admin." 
          />
          <FeatureCard 
            icon={Zap} 
            title="Realtime Tracking" 
            desc="Pantau pertumbuhan akun Anda setiap saat." 
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center border-t border-gray-100 dark:border-zinc-900">
        <p className="text-sm font-medium text-slate-400 dark:text-zinc-600">
          Made in <span className="text-primary font-bold">Amin</span> &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }: any) => (
  <div className="p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-gray-100 dark:border-zinc-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all group">
    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors text-primary dark:text-zinc-400">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
    <p className="text-slate-500 dark:text-zinc-400 text-sm">{desc}</p>
  </div>
);