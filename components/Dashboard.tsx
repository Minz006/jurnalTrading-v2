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

  const StatCard = ({ icon: Icon, label, value, subValue, colorClass, bgClass }: any) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 ${bgClass} shadow-lg transition-transform hover:scale-105 duration-300`}>
       <div className="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2">
         <Icon className="w-24 h-24 text-white" />
       </div>
       <div className="relative z-10">
         <div className="flex items-center space-x-3 mb-2">
           <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
             <Icon className="w-6 h-6 text-white" />
           </div>
           <p className="text-white/80 text-sm font-medium uppercase tracking-wider">{label}</p>
         </div>
         <h4 className="text-2xl font-bold text-white mb-1">{value}</h4>
         <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/20 text-white backdrop-blur-md`}>
            {subValue}
         </span>
       </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={DollarSign} 
          label="Saldo Saat Ini" 
          value={`$${stats.currentBalance.toFixed(2)}`}
          subValue={`${((stats.totalProfit / user.initialBalance) * 100).toFixed(2)}% ROI`}
          bgClass="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        <StatCard 
          icon={Percent} 
          label="Winrate" 
          value={`${stats.winRate.toFixed(1)}%`}
          subValue={`${stats.wins}W - ${stats.losses}L`}
          bgClass="bg-gradient-to-br from-emerald-500 to-teal-700"
        />
        <StatCard 
          icon={Activity} 
          label="Profit Factor" 
          value={stats.profitFactor.toFixed(2)}
          subValue={`${stats.totalTrades} Total Trade`}
          bgClass="bg-gradient-to-br from-purple-500 to-indigo-700"
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Max Drawdown" 
          value={`${stats.maxDrawdown.toFixed(2)}%`}
          subValue="Risk Level"
          bgClass="bg-gradient-to-br from-rose-500 to-pink-700"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Equity Curve */}
        <div className="lg:col-span-2">
          <Card title="Kurva Ekuitas (Pertumbuhan Modal)">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fullChartData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={10} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                      borderColor: '#334155', 
                      borderRadius: '12px', 
                      color: '#fff',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorBalance)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* P/L Distribution */}
        <div className="lg:col-span-1">
          <Card title="Distribusi P/L">
             <div className="h-[350px] w-full flex items-center justify-center">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                         contentStyle={{ 
                          backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#fff' 
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pnl" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        dot={{ r: 3, fill: '#10b981' }} 
                        activeDot={{ r: 6 }}
                        animationDuration={1500}
                      />
                      {/* Reference line at 0 */}
                      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#64748b" strokeDasharray="3 3" opacity={0.5} /> 
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-400">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada data trade.</p>
                  </div>
                )}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};