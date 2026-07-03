"use client";

import { useAuth } from '@/components/auth/AuthProvider';

export default function PerformanceView({ activeTab }: { activeTab: string }) {
  if (activeTab !== 'performance') return null;

  return (
    <div className="fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-gray-400 uppercase">Dashboard</h3>
        <select className="bg-white border border-gray-300 text-gray-700 text-xs font-bold py-1 px-3 rounded-lg outline-none shadow-sm dark-input">
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
            <h2 className="text-3xl font-bold">0%</h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80"><span className="text-white font-bold">0</span> of <span>0</span></p>
          </div>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2.5">
          <div className="bg-white h-2.5 rounded-full transition-all duration-500" style={{ width: '0%' }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark-element dark-border flex items-center justify-center h-40">
          <p className="text-gray-400 text-sm">Line Chart Placeholder</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark-element dark-border flex items-center justify-center h-40">
          <p className="text-gray-400 text-sm">Pie Chart Placeholder</p>
        </div>
      </div>
    </div>
  );
}
