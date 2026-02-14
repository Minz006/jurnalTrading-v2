import React from 'react';
import { Trade, User } from '../types';
import { Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
  user: User;
  onDelete: (id: string) => void;
}

export const TradeTable: React.FC<TradeTableProps> = ({ trades, user, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 dark:bg-slate-800">
          <tr className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <th className="p-4 rounded-tl-xl">Tanggal</th>
            <th className="p-4">Pair</th>
            <th className="p-4">Posisi</th>
            <th className="p-4">Lot</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-right">P/L ($)</th>
            <th className="p-4 text-right">Growth</th>
            <th className="p-4 text-center rounded-tr-xl">Aksi</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {trades.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-12 text-center text-slate-500 dark:text-slate-400">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Minus className="w-6 h-6 text-slate-400" />
                  </div>
                  <p>Belum ada data jurnal. Silakan input trade baru.</p>
                </div>
              </td>
            </tr>
          ) : (
            trades.map((trade) => {
              const isWin = trade.pnl > 0;
              const isLoss = trade.pnl < 0;
              const percentGrowth = (trade.pnl / user.initialBalance) * 100;

              return (
                <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-150 group">
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {new Date(trade.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(trade.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-800 dark:text-white">{trade.pair}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${trade.type === 'BUY' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30'}`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-mono">{trade.lot}</td>
                  <td className="p-4 text-center">
                    {isWin ? (
                      <span className="inline-flex items-center space-x-1 text-success bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full text-xs font-bold">
                        <TrendingUp className="w-3 h-3" /> <span>WIN</span>
                      </span>
                    ) : isLoss ? (
                      <span className="inline-flex items-center space-x-1 text-danger bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-full text-xs font-bold">
                        <TrendingDown className="w-3 h-3" /> <span>LOSS</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-xs font-bold">
                        <Minus className="w-3 h-3" /> <span>BE</span>
                      </span>
                    )}
                  </td>
                  <td className={`p-4 text-right font-bold text-base ${isWin ? 'text-success' : isLoss ? 'text-danger' : 'text-slate-500'}`}>
                    {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                  </td>
                  <td className={`p-4 text-right font-medium ${percentGrowth > 0 ? 'text-success' : percentGrowth < 0 ? 'text-danger' : 'text-slate-500'}`}>
                    {percentGrowth > 0 ? '+' : ''}{percentGrowth.toFixed(2)}%
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => onDelete(trade.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};