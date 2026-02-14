import React, { useState } from 'react';
import { User } from '../types';
import { ApiService } from '../services/api';
import { Lock, Mail, Wallet, Loader2, TrendingUp, UserCircle, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [initialBalance, setInitialBalance] = useState('1000');
  const [label, setLabel] = useState('Trader Forex');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const resetForm = () => {
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
    // Keep email for better UX
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
        await ApiService.forgotPassword(email);
        setSuccessMsg('Permintaan reset kata sandi telah dikirim ke Admin. Silakan hubungi admin untuk konfirmasi.');
    } catch (err: any) {
        setError(err.message || 'Gagal mengirim permintaan.');
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'REGISTER') {
        // Validasi Frontend Tambahan
        if (password.length < 6) {
           throw new Error('Kata sandi minimal 6 karakter.');
        }
        if (password !== confirmPassword) {
           throw new Error('Konfirmasi kata sandi tidak cocok.');
        }

        const data = await ApiService.register(email, password, initialBalance, label);
        ApiService.setToken(data.token);
        onLogin(data.user);
      } else {
        // Login Logic
        const data = await ApiService.login(email, password);
        ApiService.setToken(data.token);
        onLogin(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // Render Logic Helper
  const isRegister = mode === 'REGISTER';
  const isLogin = mode === 'LOGIN';
  const isForgot = mode === 'FORGOT_PASSWORD';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 relative z-10 animate-fade-in-up">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-xl mb-4 shadow-lg shadow-blue-500/30">
             <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Jurnal Trading</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isRegister && 'Mulai perjalanan trading profesional Anda'}
            {isLogin && 'Selamat datang kembali, Trader!'}
            {isForgot && 'Request Reset ke Admin'}
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium animate-pulse">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/50 text-green-600 dark:text-green-400 p-3 rounded-lg mb-6 text-sm text-center font-medium flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" /> <span className="text-xs">{successMsg}</span>
          </div>
        )}

        {/* Forgot Password View */}
        {isForgot ? (
          <form onSubmit={handleForgotPassword} className="space-y-5 animate-fade-in-up">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Akun Anda</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                  placeholder="nama@email.com"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                  Password akan direset manual oleh admin.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Request Reset'}
            </button>
            <button
              type="button"
              onClick={() => switchMode('LOGIN')}
              className="w-full flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary transition font-medium text-sm py-2"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Login
            </button>
          </form>
        ) : (
          /* Login & Register Forms */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Kata Sandi</label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => switchMode('FORGOT_PASSWORD')}
                    className="text-xs text-primary hover:text-blue-600 font-bold hover:underline"
                  >
                    Lupa Kata Sandi?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-12 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isRegister && (
               <div className="space-y-5 animate-fade-in-up">
                
                {/* Konfirmasi Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Konfirmasi Kata Sandi</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full bg-gray-50 dark:bg-slate-800 border rounded-xl py-3 pl-10 pr-12 text-slate-800 dark:text-white focus:ring-2 outline-none transition-all placeholder:text-slate-400 ${
                         confirmPassword && password !== confirmPassword 
                         ? 'border-red-500 focus:ring-red-500/50' 
                         : 'border-gray-200 dark:border-slate-700 focus:ring-primary/50 focus:border-primary'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 ml-1">Kata sandi tidak cocok</p>
                  )}
                </div>

                <div>
                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Modal Awal ($)</label>
                 <div className="relative group">
                   <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                   <input
                     type="number"
                     required
                     min="0"
                     value={initialBalance}
                     onChange={(e) => setInitialBalance(e.target.value)}
                     className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                     placeholder="1000"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tipe Trader</label>
                 <div className="relative group">
                   <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                   <select
                     value={label}
                     onChange={(e) => setLabel(e.target.value)}
                     className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                   >
                     <option value="Trader Forex">Trader Forex</option>
                     <option value="Investor Saham">Investor Saham</option>
                     <option value="Crypto Trader">Crypto Trader</option>
                     <option value="Gold Trader">Gold Trader</option>
                     <option value="Scalper">Scalper</option>
                     <option value="Swing Trader">Swing Trader</option>
                   </select>
                 </div>
               </div>
             </div>
            )}

            <button
              type="submit"
              disabled={loading || (isRegister && password !== confirmPassword)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isRegister ? 'Buat Akun' : 'Masuk Dashboard')}
            </button>
          </form>
        )}

        {!isForgot && (
          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
            <button
              onClick={() => switchMode(isRegister ? 'LOGIN' : 'REGISTER')}
              className="text-primary hover:text-blue-600 dark:hover:text-blue-400 font-bold hover:underline transition"
            >
              {isRegister ? 'Masuk disini' : 'Daftar sekarang'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};