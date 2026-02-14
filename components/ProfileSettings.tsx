import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ApiService } from '../services/api';
import { Wallet, Save, Loader2, CheckCircle } from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
  onUpdateUser: (updatedFields: Partial<User>) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdateUser }) => {
  const [initialBalance, setInitialBalance] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
        setInitialBalance(user.initialBalance.toString());
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const balanceVal = parseFloat(initialBalance);
    if (isNaN(balanceVal) || balanceVal < 0) {
        setError('Modal awal harus berupa angka positif.');
        return;
    }

    setLoading(true);
    try {
        const res = await ApiService.updateUserProfile(balanceVal);
        onUpdateUser({ initialBalance: balanceVal });
        setSuccess('Profil berhasil diperbarui.');
    } catch (e: any) {
        setError(e.message || 'Gagal menyimpan perubahan.');
    } finally {
        setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 pl-10 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400";
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
                <label className={labelClass}>Edit Modal Awal ($)</label>
                <div className="relative group">
                    <Wallet className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input 
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        className={inputClass}
                        placeholder="1000"
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    Ubah nilai ini jika Anda salah memasukkan modal awal saat pendaftaran. 
                    Statistik akan dihitung ulang otomatis.
                </p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5" /> <span>Simpan Profil</span></>}
            </button>
        </form>
    </div>
  );
};