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

  const StatCard = ({ icon: Icon, label, value, subValue, iconColorClass, iconBgClass }: any) => (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
       <div className="flex items-start justify-between">
         <div>
           <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">{label}</p>
           <h4 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-1">{value}</h4>
           <span className="text-xs font-medium text-slate-400">
              {subValue}
           </span>
         </div>
         {/* Icon Container: Keep colored in light, but neutral or subtle in dark if desired, keeping color for identity */}
         <div className={`p-3 rounded-xl ${iconBgClass}`}>
           <Icon className={`w-6 h-6 ${iconColorClass}`} />
         </div>
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
          iconColorClass="text-blue-600 dark:text-blue-400"
          iconBgClass="bg-blue-50 dark:bg-zinc-800"
        />
        <StatCard 
          icon={Percent} 
          label="Winrate" 
          value={`${stats.winRate.toFixed(1)}%`}
          subValue={`${stats.wins}W - ${stats.losses}L`}
          iconColorClass="text-emerald-600 dark:text-emerald-400"
          iconBgClass="bg-emerald-50 dark:bg-zinc-800"
        />
        <StatCard 
          icon={Activity} 
          label="Profit Factor" 
          value={stats.profitFactor.toFixed(2)}
          subValue={`${stats.totalTrades} Total Trade`}
          iconColorClass="text-purple-600 dark:text-purple-400"
          iconBgClass="bg-purple-50 dark:bg-zinc-800"
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Max Drawdown" 
          value={`${stats.maxDrawdown.toFixed(2)}%`}
          subValue="Risk Level"
          iconColorClass="text-rose-600 dark:text-rose-400"
          iconBgClass="bg-rose-50 dark:bg-zinc-800"
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
                    stroke="#52525b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={10} 
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(24, 24, 27, 0.95)', // Zinc-950
                      borderColor: '#27272a', // Zinc-800
                      borderRadius: '8px', 
                      color: '#fff',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#a1a1aa' }} // Zinc-400
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
                      <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                         contentStyle={{ 
                          backgroundColor: 'rgba(24, 24, 27, 0.95)', // Zinc-950 
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
                      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#52525b" strokeDasharray="3 3" opacity={0.5} /> 
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