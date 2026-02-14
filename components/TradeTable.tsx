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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-slate-400 text-xs uppercase border-b border-slate-700">
            <th className="p-4 font-medium">Tanggal</th>
            <th className="p-4 font-medium">Fair (Pair)</th>
            <th className="p-4 font-medium">Posisi</th>
            <th className="p-4 font-medium">Lot</th>
            <th className="p-4 font-medium text-center">Hasil</th>
            <th className="p-4 font-medium text-right">P/L ($)</th>
            <th className="p-4 font-medium text-right">Pertumbuhan (%)</th>
            <th className="p-4 font-medium text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {trades.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-8 text-center text-slate-500">
                Belum ada data jurnal. Silakan input trade baru.
              </td>
            </tr>
          ) : (
            trades.map((trade) => {
              const isWin = trade.pnl > 0;
              const isLoss = trade.pnl < 0;
              const percentGrowth = (trade.pnl / user.initialBalance) * 100;

              return (
                <tr key={trade.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition">
                  <td className="p-4 text-slate-300">
                    {new Date(trade.date).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="p-4 font-bold text-white">{trade.pair}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${trade.type === 'BUY' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{trade.lot}</td>
                  <td className="p-4 text-center">
                    {isWin ? (
                      <span className="flex items-center justify-center space-x-1 text-success font-bold">
                        <TrendingUp className="w-4 h-4" /> <span>WIN</span>
                      </span>
                    ) : isLoss ? (
                      <span className="flex items-center justify-center space-x-1 text-danger font-bold">
                        <TrendingDown className="w-4 h-4" /> <span>LOSS</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-1 text-slate-400 font-bold">
                        <Minus className="w-4 h-4" /> <span>BE</span>
                      </span>
                    )}
                  </td>
                  <td className={`p-4 text-right font-bold ${isWin ? 'text-success' : isLoss ? 'text-danger' : 'text-slate-400'}`}>
                    {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                  </td>
                  <td className={`p-4 text-right ${percentGrowth > 0 ? 'text-success' : percentGrowth < 0 ? 'text-danger' : 'text-slate-400'}`}>
                    {percentGrowth > 0 ? '+' : ''}{percentGrowth.toFixed(2)}%
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => onDelete(trade.id)}
                      className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded transition"
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