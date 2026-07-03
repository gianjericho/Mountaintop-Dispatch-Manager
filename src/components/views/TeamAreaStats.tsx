"use client";

import { ServiceOrder } from '@/services/dispatchService';

interface TeamAreaStatsProps {
  orders: ServiceOrder[];
  onTeamClick: (team: string) => void;
}

export default function TeamAreaStats({ orders, onTeamClick }: TeamAreaStatsProps) {
  const teamStats: Record<string, { total: number, done: number }> = {};
  const areaStats: Record<string, { total: number, done: number }> = {};

  orders.forEach(o => {
    if (!o.team || !o.area) return;
    
    if (!teamStats[o.team]) teamStats[o.team] = { total: 0, done: 0 };
    if (!areaStats[o.area]) areaStats[o.area] = { total: 0, done: 0 };

    teamStats[o.team].total++;
    areaStats[o.area].total++;

    if (o.status === 'done') {
      teamStats[o.team].done++;
      areaStats[o.area].done++;
    }
  });

  const sortedTeams = Object.entries(teamStats)
    .sort((a, b) => b[1].total - a[1].total);

  const sortedAreas = Object.entries(areaStats)
    .sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {sortedTeams.map(([team, stats]) => {
          const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
          return (
            <div 
              key={team} 
              onClick={() => onTeamClick(team)}
              className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition dark-element dark-border"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">{team}</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 rounded">{stats.done}/{stats.total}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 dark-bg-sub">
                <div className={`h-1.5 rounded-full ${percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${percent}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {sortedAreas.map(([area, stats]) => {
          const percent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
          return (
            <div key={area} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 dark-element dark-border">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 dark-bg-sub">
                <i className="fa-solid fa-map-location-dot text-indigo-500"></i>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-gray-700 dark-text">{area}</span>
                  <span className="text-xs text-gray-400 font-bold">{stats.done} / {stats.total}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 dark-bg-sub">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
