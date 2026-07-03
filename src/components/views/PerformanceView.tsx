"use client";

import { useState, useMemo } from 'react';
import { useDispatchData } from '@/context/DispatchContext';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import TeamAreaStats from '@/components/views/TeamAreaStats';

export default function PerformanceView({ activeTab, appMode }: { activeTab: string; appMode: string }) {
  const { orders } = useDispatchData();
  const [perfFilter, setPerfFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    let list = orders.filter(o => (o.type || 'SLR') === appMode);

    if (perfFilter === 'today') {
      const today = new Date().toLocaleDateString('en-US');
      list = list.filter(o => o.dateAdded === today || o.dateDone === today);
    } else if (perfFilter === 'week') {
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      list = list.filter(o => {
        const d = new Date(o.dateAdded || o.created_at);
        return d >= lastWeek && d <= today;
      });
    } else if (perfFilter === 'month') {
      const today = new Date();
      const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      list = list.filter(o => {
        const d = new Date(o.dateAdded || o.created_at);
        return d >= lastMonth && d <= today;
      });
    }
    
    return list;
  }, [orders, appMode, perfFilter]);

  if (activeTab !== 'performance') return null;

  const total = filteredOrders.length;
  const done = filteredOrders.filter(o => o.status === 'done').length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  // Line Chart Data Prep
  const dateCounts: Record<string, number> = {};
  filteredOrders.forEach(o => {
    if (o.status === 'done' && o.dateDone) {
      dateCounts[o.dateDone] = (dateCounts[o.dateDone] || 0) + 1;
    }
  });
  const lineLabels = Object.keys(dateCounts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const lineData = lineLabels.map(l => dateCounts[l]);

  // Pie Chart Data Prep
  const troubleCounts: Record<string, number> = {};
  filteredOrders.forEach(o => {
    const t = o.trouble ? o.trouble.trim() : 'Unspecified';
    troubleCounts[t] = (troubleCounts[t] || 0) + 1;
  });
  const pieLabels = Object.keys(troubleCounts);
  const pieData = Object.values(troubleCounts);

  const handleTeamClick = (team: string) => {
    window.dispatchEvent(new CustomEvent('open-team-analytics', { detail: team }));
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-gray-400 uppercase">Dashboard</h3>
        <select 
          value={perfFilter} 
          onChange={e => setPerfFilter(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 text-xs font-bold py-1 px-3 rounded-lg outline-none shadow-sm dark-input"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="bg-slate-800 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white rounded-full opacity-10 blur-xl"></div>
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Efficiency Score</p>
            <h2 className="text-3xl font-bold">{percent}%</h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80"><span className="text-white font-bold">{done}</span> of <span>{total}</span></p>
          </div>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2.5">
          <div className="bg-white h-2.5 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark-element dark-border">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 dark-text">Tickets Resolved</h4>
          <div className="relative h-40 w-full">
            <LineChart labels={lineLabels} data={lineData} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark-element dark-border">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 dark-text">Trouble Types</h4>
          <div className="relative h-40 w-full">
            <PieChart labels={pieLabels} data={pieData} />
          </div>
        </div>
      </div>

      <TeamAreaStats orders={filteredOrders} onTeamClick={handleTeamClick} />
    </div>
  );
}
