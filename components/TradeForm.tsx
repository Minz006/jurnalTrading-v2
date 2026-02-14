import React, { useState } from 'react';
import { Trade } from '../types';
import { PlusCircle, Info } from 'lucide-react';

interface TradeFormProps {
  onAddTrade: (trade: Trade) => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onAddTrade }) => {
  const [pair, setPair] = useState('');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [lot, setLot] = useState('');
  const [pnl, setPnl] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair || !lot || !pnl) return;

    const newTrade: Trade = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      pair: pair.toUpperCase(),
      type,
      lot: parseFloat(lot),
      pnl: parseFloat(pnl),
      notes
    };

    onAddTrade(newTrade);
    
    // Reset Form
    setPair('');
    setLot('');
    setPnl('');
    setNotes('');
  };

  const inputClass = "w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400";
  const labelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pair / Fair Input */}
        <div>
          <label className={labelClass}>Pair / Aset</label>
          <input
            type="text"
            required
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            placeholder="XAUUSD"
            className={inputClass}
          />
        </div>

        {/* Type */}
        <div>
          <label className={labelClass}>Posisi</label>
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200 ${type === 'BUY' ? 'bg-success text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200 ${type === 'SELL' ? 'bg-danger text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Lot */}
        <div>
          <label className={labelClass}>Lot Size</label>
          <input
            type="number"
            step="0.01"
            required
            value={lot}
            onChange={(e) => setLot(e.target.value)}
            placeholder="0.10"
            className={inputClass}
          />
        </div>

        {/* P/L */}
        <div>
          <label className={labelClass}>Profit / Loss ($)</label>
          <input
            type="number"
            step="0.01"
            required
            value={pnl}
            onChange={(e) => setPnl(e.target.value)}
            placeholder="-50.00"
            className={`${inputClass} font-bold ${
              parseFloat(pnl) > 0 ? 'text-success dark:text-success' : parseFloat(pnl) < 0 ? 'text-danger dark:text-danger' : ''
            }`}
          />
        </div>
      </div>

      <div>
          <label className={labelClass}>Catatan Trade (Opsional)</label>
          <div className="relative">
             <Info className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
             <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Analisa: Supply area H4, konfirmasi engulfing..."
                className={`${inputClass} pl-10 resize-none`}
             />
          </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="w-full md:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-500/30 transition-all transform active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Simpan Jurnal</span>
        </button>
      </div>
    </form>
  );
};