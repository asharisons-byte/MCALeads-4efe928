import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, MessageSquare, DollarSign, Activity, Loader2 } from 'lucide-react';
import { TeamMemberPerformance } from '../types';

export const TeamPage: React.FC = () => {
  const [performance, setPerformance] = useState<TeamMemberPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerformance() {
      try {
        const response = await fetch('/api/team/performance');
        const data = await response.json();
        if (data.performance) {
          setPerformance(data.performance);
        }
      } catch (err) {
        console.error('Failed to fetch team performance:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPerformance();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Team Management & Performance</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <p className="text-slate-400 text-xs uppercase">Total Members</p>
          <p className="text-2xl font-bold text-white">{performance.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <p className="text-slate-400 text-xs uppercase">Total Calls</p>
          <p className="text-2xl font-bold text-white">{performance.reduce((sum, m) => sum + m.calls_made, 0)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <p className="text-slate-400 text-xs uppercase">Emails Sent</p>
          <p className="text-2xl font-bold text-white">{performance.reduce((sum, m) => sum + m.emails_sent, 0)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <p className="text-slate-400 text-xs uppercase">Total Won Revenue</p>
          <p className="text-2xl font-bold text-white">${performance.reduce((sum, m) => sum + m.won_revenue, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Calls</th>
              <th className="px-4 py-3">Emails</th>
              <th className="px-4 py-3">SMS</th>
              <th className="px-4 py-3">Won Revenue</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {performance.map((member) => (
              <tr key={member.user_id} className="border-t border-slate-800 hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium">{member.name}</td>
                <td className="px-4 py-3">{member.role}</td>
                <td className="px-4 py-3">{member.calls_made}</td>
                <td className="px-4 py-3">{member.emails_sent}</td>
                <td className="px-4 py-3">{member.sms_sent}</td>
                <td className="px-4 py-3">${member.won_revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
