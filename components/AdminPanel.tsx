import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Shield, Trash2, RefreshCw, LogOut, Loader2, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await ApiService.adminLogin(password);
      setToken(data.token);
      setIsAdminLoggedIn(true);
      fetchUsers(data.token);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (authToken: string) => {
    try {
      const data = await ApiService.adminGetUsers(authToken);
      setUsers(data);
    } catch (e) { console.error(e); }
  };

  const handleReset = async (userId: string) => {
    if (!confirm('Reset password user ini ke "123456"?')) return;
    setActionLoading(userId);
    try {
      await ApiService.adminResetPassword(token, userId);
      alert('Password berhasil direset menjadi "123456"');
      fetchUsers(token);
    } catch (e) {
      alert('Gagal reset');
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleActivate = async (userId: string) => {
      setActionLoading(userId);
      try {
          await ApiService.adminActivateUser(token, userId);
          fetchUsers(token);
      } catch (e) {
          alert('Gagal mengaktifkan user');
      } finally {
          setActionLoading(null);
      }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('PERINGATAN: Hapus user ini? Data jurnal akan hilang permanen dan email bisa dipakai daftar lagi.')) return;
    setActionLoading(userId);
    try {
      await ApiService.adminDeleteUser(token, userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (e) {
      alert('Gagal menghapus');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Shield className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Admin Panel Access</h2>
          {error && <p className="text-red-400 text-center mb-4 text-sm">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="Masukkan Kunci Admin"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-600 text-white font-bold p-3 rounded-lg transition flex justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Buka Gerbang'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-800 dark:text-slate-200">
      <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="text-primary" />
            <span className="font-bold text-lg text-slate-800 dark:text-white">Admin Control</span>
          </div>
          <button onClick={() => window.location.href = '/'} className="flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white">
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Daftar Pengguna ({users.length})</h2>
          <button onClick={() => fetchUsers(token)} className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-950 text-slate-500 uppercase font-bold text-xs">
                <tr>
                  <th className="p-4">Email / Label</th>
                  <th className="p-4">Saldo Awal</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-white">{u.email}</div>
                      <div className="text-xs text-primary mt-1">{u.label}</div>
                      <div className="text-xs text-slate-400 mt-1">Joined: {new Date(u.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-700 dark:text-slate-300">${parseFloat(u.initial_balance).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                          {/* Active Status Flag */}
                          {!u.is_active ? (
                             <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-bold">
                                <span>Inactive</span>
                             </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                                <CheckCircle className="w-3 h-3" />
                                <span>Aktif</span>
                            </span>
                          )}

                          {/* Reset Flag */}
                          {u.reset_requested && (
                            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-bold animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Minta Reset</span>
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        {/* Activation Button */}
                        {!u.is_active && (
                            <button
                                onClick={() => handleActivate(u.id)}
                                disabled={actionLoading === u.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1"
                                title="Aktifkan Akun"
                            >
                                {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <><UserCheck className="w-3 h-3" /><span>Aktifkan</span></>}
                            </button>
                        )}

                        {u.reset_requested && (
                          <button 
                            onClick={() => handleReset(u.id)}
                            disabled={actionLoading === u.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1"
                          >
                            {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <span>Reset PW</span>}
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(u.id)}
                          disabled={actionLoading === u.id}
                          className="bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 p-2 rounded-md transition"
                          title="Hapus Permanen"
                        >
                          {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};