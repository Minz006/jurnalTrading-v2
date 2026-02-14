import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { Lock, Save, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const ChangePasswordForm: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
        setError('Kata sandi baru minimal 6 karakter.');
        return;
    }
    if (newPassword !== confirmPassword) {
        setError('Konfirmasi kata sandi baru tidak cocok.');
        return;
    }

    setLoading(true);
    try {
        await ApiService.changePassword(oldPassword, newPassword);
        setSuccess('Kata sandi berhasil diubah.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 pr-10 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400";
  const labelClass = "block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-2";

  return (
    <div className="animate-fade-in-up max-w-lg mx-auto">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 p-3 rounded-lg mb-6 text-sm text-center font-medium flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className={labelClass}>Kata Sandi Lama</label>
                <div className="relative">
                    <input 
                        type={showOld ? "text" : "password"} 
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className={inputClass}
                        placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-3 text-slate-400 hover:text-primary">
                        {showOld ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                </div>
            </div>

            <hr className="border-gray-100 dark:border-zinc-800" />

            <div>
                <label className={labelClass}>Kata Sandi Baru</label>
                <div className="relative">
                    <input 
                        type={showNew ? "text" : "password"} 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputClass}
                        placeholder="Min 6 karakter"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3 text-slate-400 hover:text-primary">
                        {showNew ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                </div>
            </div>

            <div>
                <label className={labelClass}>Konfirmasi Kata Sandi Baru</label>
                <div className="relative">
                    <input 
                        type={showNew ? "text" : "password"} 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputClass}
                        placeholder="Ulangi kata sandi baru"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5" /> <span>Simpan Perubahan</span></>}
            </button>
        </form>
    </div>
  );
};