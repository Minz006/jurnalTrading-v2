import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Statistics, Trade, User } from '../types';
import { Card } from './ui/Card';
import { TrendingUp, TrendingDown, Percent, DollarSign, Activity, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  stats: Statistics;
  trades: Trade[];
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, trades, user }) => {
  
  // Prepare data for chart (Cumulative Balance)
  let runningBalance = user.initialBalance;
  const chartData = [...trades].reverse().map((trade) => {
    runningBalance += trade.pnl;
    return {
      date: new Date(trade.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      balance: runningBalance,
      pnl: trade.pnl
    };
  });

  // Add initial point
  const fullChartData = [
    { date: 'Start', balance: user.initialBalance, pnl: 0 },
    ...chartData
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center space-x-4 border-l-4 border-l-primary">
          <div className="p-3 rounded-full bg-slate-900 text-primary">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Saldo Saat Ini</p>
            <h4 className="text-xl font-bold text-white">${stats.currentBalance.toFixed(2)}</h4>
            <span className={`text-xs ${stats.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
              {stats.totalProfit >= 0 ? '+' : ''}{((stats.totalProfit / user.initialBalance) * 100).toFixed(2)}% ROI
            </span>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 border-l-4 border-l-success">
          <div className="p-3 rounded-full bg-slate-900 text-success">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Winrate</p>
            <h4 className="text-xl font-bold text-white">{stats.winRate.toFixed(1)}%</h4>
            <span className="text-xs text-slate-500">{stats.wins}W - {stats.losses}L</span>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 border-l-4 border-l-purple-500">
          <div className="p-3 rounded-full bg-slate-900 text-purple-500">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Profit Factor</p>
            <h4 className="text-xl font-bold text-white">{stats.profitFactor.toFixed(2)}</h4>
            <span className="text-xs text-slate-500">{stats.totalTrades} Total Trade</span>
          </div>
        </Card>

        <Card className="flex items-center space-x-4 border-l-4 border-l-danger">
          <div className="p-3 rounded-full bg-slate-900 text-danger">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Max Drawdown</p>
            <h4 className="text-xl font-bold text-white">{stats.maxDrawdown.toFixed(2)}%</h4>
            <span className="text-xs text-slate-500">Risiko Terbesar</span>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Equity Curve */}
        <div className="lg:col-span-2">
          <Card title="Kurva Ekuitas (Pertumbuhan Modal)">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fullChartData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* P/L Distribution */}
        <div>
          <Card title="Distribusi P/L">
             <div className="h-[300px] w-full flex items-center justify-center">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2} dot={false} />
                      {/* Reference line at 0 */}
                      <line x1="0" y1="150" x2="100%" y2="150" stroke="#64748b" strokeDasharray="3 3" /> 
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-500 text-sm">Belum ada data trade.</p>
                )}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};