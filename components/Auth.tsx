import React, { useState } from 'react';
import { User } from '../types';
import { ApiService } from '../services/api';
import { Lock, Mail, Wallet, Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [initialBalance, setInitialBalance] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let data;
      if (isRegister) {
        data = await ApiService.register(email, password, initialBalance);
      } else {
        data = await ApiService.login(email, password);
      }

      ApiService.setToken(data.token);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface p-8 rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Jurnal Trading</h1>
          <p className="text-slate-400">
            {isRegister ? 'Buat akun baru untuk memulai' : 'Masuk untuk mengakses jurnal Anda'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isRegister && (
             <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">Modal Awal ($)</label>
             <div className="relative">
               <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
               <input
                 type="number"
                 required
                 min="0"
                 value={initialBalance}
                 onChange={(e) => setInitialBalance(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                 placeholder="1000"
               />
             </div>
           </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isRegister ? 'Daftar Sekarang' : 'Masuk')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-primary hover:text-blue-400 font-semibold"
          >
            {isRegister ? 'Masuk' : 'Daftar'}
          </button>
        </div>
      </div>
    </div>
  );
};