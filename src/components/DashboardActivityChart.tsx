import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ActivityEvent } from '../types';

interface DashboardActivityChartProps {
  activities: ActivityEvent[];
}

export const DashboardActivityChart: React.FC<DashboardActivityChartProps> = ({ activities }) => {
  const chartData = useMemo(() => {
    const data: Record<string, { date: string; calls: number; emails: number }> = {};
    const now = new Date();
    
    // Initialize last 30 days
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      data[dateStr] = { date: dateStr, calls: 0, emails: 0 };
    }

    activities.forEach((act) => {
      const dateStr = act.timestamp.split('T')[0];
      if (data[dateStr]) {
        const type = (act.activity_type || act.type || '').toLowerCase();
        if (type.includes('call')) data[dateStr].calls++;
        if (type.includes('email')) data[dateStr].emails++;
      }
    });

    return Object.values(data).reverse();
  }, [activities]);

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" stroke="#475569" fontSize={10} tickFormatter={(v) => v.slice(5)} />
          <YAxis stroke="#475569" fontSize={10} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '12px' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Area type="monotone" dataKey="calls" stroke="#10b981" fillOpacity={1} fill="url(#colorCalls)" name="Calls" />
          <Area type="monotone" dataKey="emails" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEmails)" name="Emails" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
