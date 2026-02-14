import React, { useState } from 'react';
import { Trade } from '../types';
import { PlusCircle, Save } from 'lucide-react';

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pair / Fair Input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Pair / Fair</label>
          <input
            type="text"
            required
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            placeholder="contoh: XAUUSD"
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-primary outline-none"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Posisi</label>
          <div className="flex bg-slate-900 rounded border border-slate-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`flex-1 py-2 text-sm font-semibold transition ${type === 'BUY' ? 'bg-success text-white' : 'text-slate-400 hover:text-white'}`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`flex-1 py-2 text-sm font-semibold transition ${type === 'SELL' ? 'bg-danger text-white' : 'text-slate-400 hover:text-white'}`}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Lot */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Lot Size</label>
          <input
            type="number"
            step="0.01"
            required
            value={lot}
            onChange={(e) => setLot(e.target.value)}
            placeholder="0.10"
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-primary outline-none"
          />
        </div>

        {/* P/L */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">P/L ($)</label>
          <input
            type="number"
            step="0.01"
            required
            value={pnl}
            onChange={(e) => setPnl(e.target.value)}
            placeholder="-50 atau 100"
            className={`w-full bg-slate-900 border border-slate-700 rounded p-2 focus:border-primary outline-none font-bold ${
              parseFloat(pnl) > 0 ? 'text-success' : parseFloat(pnl) < 0 ? 'text-danger' : 'text-white'
            }`}
          />
        </div>
      </div>

      <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Catatan (Opsional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alasan entry..."
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-primary outline-none text-sm"
          />
      </div>

      <button
        type="submit"
        className="w-full md:w-auto flex items-center justify-center space-x-2 bg-primary hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Tambah Jurnal</span>
      </button>
    </form>
  );
};