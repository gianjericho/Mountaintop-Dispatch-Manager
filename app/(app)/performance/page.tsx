'use client';

import React, { useState } from 'react';
import { calculatePerformanceStats } from '../../../lib/domain/performance';
import { getMonthRange } from '../../../lib/domain/dates';
import { useAppContext } from '../app-context';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  PieChart as PieIcon,
  Calendar,
  Users,
  Award,
  Download,
  MapPin,
  UserCheck,
  ChevronRight,
  History,
  Tag
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#64748b'];

export default function PerformancePage() {
  const { orders, appMode } = useAppContext();
  const [period, setPeriod] = useState<'thisMonth' | 'lastMonth' | 'custom' | 'all'>('thisMonth');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (period === 'thisMonth') {
    const range = getMonthRange(0);
    startDate = range.start;
    endDate = range.end;
  } else if (period === 'lastMonth') {
    const range = getMonthRange(-1);
    startDate = range.start;
    endDate = range.end;
  } else if (period === 'custom' && customStart && customEnd) {
    startDate = new Date(customStart);
    endDate = new Date(customEnd);
  }

  // Filter orders by mode
  const modeOrders = (orders || []).filter(o => o.type === appMode);
  const stats = calculatePerformanceStats(modeOrders, startDate, endDate);

  // Derive Team List
  const teamNames = Object.keys(stats.teamStats).sort();

  // If a team is selected, derive team detail metrics
  const activeTeamName = selectedTeam && stats.teamStats[selectedTeam] ? selectedTeam : (teamNames[0] || null);

  const activeTeamOrders = modeOrders.filter(o => activeTeamName && o.team === activeTeamName);
  const activeTeamDoneOrders = activeTeamOrders.filter(o => o.status === 'done');

  // Top Area for Selected Team
  const teamAreaMap: { [area: string]: number } = {};
  activeTeamOrders.forEach(o => {
    const a = o.area || 'Unknown';
    teamAreaMap[a] = (teamAreaMap[a] || 0) + 1;
  });
  const topTeamArea = Object.keys(teamAreaMap).sort((a, b) => teamAreaMap[b] - teamAreaMap[a])[0] || 'N/A';

  // Per-Technician Leaderboard
  const techMap: { [tech: string]: { dispatched: number; resolved: number } } = {};
  modeOrders.forEach(o => {
    const tech = o.assigned_tech ? o.assigned_tech.trim() : 'Unassigned Tech';
    if (!techMap[tech]) techMap[tech] = { dispatched: 0, resolved: 0 };
    techMap[tech].dispatched++;
    if (o.status === 'done') techMap[tech].resolved++;
  });

  const techStats = Object.keys(techMap)
    .map(tech => ({
      tech,
      dispatched: techMap[tech].dispatched,
      resolved: techMap[tech].resolved,
      efficiency: techMap[tech].dispatched > 0 ? Math.round((techMap[tech].resolved / techMap[tech].dispatched) * 100) : 0
    }))
    .sort((a, b) => b.resolved - a.resolved);

  // Barangay Breakdown
  const barangayMap: { [bgy: string]: { area: string; total: number; done: number } } = {};
  modeOrders.forEach(o => {
    const bgy = o.barangay ? o.barangay.trim().toUpperCase() : 'UNKNOWN';
    if (!barangayMap[bgy]) barangayMap[bgy] = { area: o.area || 'UNKNOWN', total: 0, done: 0 };
    barangayMap[bgy].total++;
    if (o.status === 'done') barangayMap[bgy].done++;
  });

  const barangayStats = Object.keys(barangayMap)
    .map(bgy => ({
      barangay: bgy,
      area: barangayMap[bgy].area,
      total: barangayMap[bgy].total,
      done: barangayMap[bgy].done,
      rate: Math.round((barangayMap[bgy].done / barangayMap[bgy].total) * 100)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // CSV Report Export
  const handleExportCSV = () => {
    const headers = ['Type', 'Ticket No', 'Account No', 'Name', 'Area', 'Barangay', 'Status', 'Team', 'Assigned Tech', 'Date Reported', 'Date Added', 'Date Done'];
    const rows = modeOrders.map(o => [
      o.type,
      o.ticket_no,
      o.account_no,
      `"${o.name.replace(/"/g, '""')}"`,
      o.area,
      o.barangay,
      o.status,
      o.team,
      o.assigned_tech || '',
      o.date_reported || '',
      o.dateAdded || '',
      o.dateDone || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dispatch_performance_report_${appMode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Month Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            Performance & Analytics Dashboard ({appMode})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time technician efficiency, trouble type breakdown, team drilldown, and barangay geography.
          </p>
        </div>

        {/* Action Controls & Period Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shadow"
          >
            <Download className="w-4 h-4" /> Export Report CSV
          </button>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-slate-400 ml-1" />
            <button
              onClick={() => setPeriod('thisMonth')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'thisMonth' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('lastMonth')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'lastMonth' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setPeriod('custom')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'custom' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom Range
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                period === 'all' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Inputs if Custom selected */}
      {period === 'custom' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3 text-xs">
          <span className="text-slate-300 font-medium">Custom Date Range:</span>
          <input
            type="date"
            value={customStart}
            onChange={e => setCustomStart(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1 focus:outline-none focus:border-cyan-500"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={e => setCustomEnd(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1 focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Global Efficiency</p>
            <h3 className="text-3xl font-black text-cyan-400 mt-1">{stats.efficiencyRate}%</h3>
            <p className="text-xs text-slate-500 mt-1">Completion rate for period</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Dispatched</p>
            <h3 className="text-3xl font-black text-amber-400 mt-1">{stats.totalDispatched}</h3>
            <p className="text-xs text-slate-500 mt-1">Orders assigned to teams</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Resolved</p>
            <h3 className="text-3xl font-black text-emerald-400 mt-1">{stats.totalResolved}</h3>
            <p className="text-xs text-slate-500 mt-1">Successfully completed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Per-Team Interactive Cards & Team Drilldown View */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          Per-Team Performance Metrics (Click card to inspect top area & history)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {teamNames.map(teamName => {
            const team = stats.teamStats[teamName];
            const isSelected = activeTeamName === teamName;
            return (
              <button
                key={teamName}
                onClick={() => setSelectedTeam(teamName)}
                className={`text-left bg-slate-950 border rounded-xl p-4 space-y-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                    {teamName}
                    {isSelected && <ChevronRight className="w-4 h-4 text-cyan-400" />}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400">{team.efficiency}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all"
                    style={{ width: `${team.efficiency}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Dispatched: {team.dispatched}</span>
                  <span>Resolved: {team.resolved}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Team Detail View (Top Area & History) */}
        {activeTeamName && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mt-4 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  Team Details — {activeTeamName}
                </h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Top Area Served: <strong className="text-cyan-300 font-mono">{topTeamArea}</strong> | Total Dispatched: <strong className="text-amber-300 font-mono">{activeTeamOrders.length}</strong> | Total Completed: <strong className="text-emerald-300 font-mono">{activeTeamDoneOrders.length}</strong>
                </p>
              </div>
            </div>

            {/* Team Recent Completion History */}
            <div className="space-y-2">
              <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-emerald-400" />
                Recent Completion History ({activeTeamDoneOrders.length} resolved tickets):
              </h5>

              {activeTeamDoneOrders.length === 0 ? (
                <p className="text-slate-500 py-3 text-center">No completed tickets for {activeTeamName} in selected period.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeTeamDoneOrders.slice(0, 15).map(order => (
                    <div key={order.id} className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between font-mono">
                      <div>
                        <span className="font-bold text-slate-200">{order.name}</span>
                        <span className="text-slate-400 text-[11px] ml-2">Ticket: {order.ticket_no} | Account: {order.account_no}</span>
                        <p className="text-[10px] text-slate-500 font-sans mt-0.5">Area: {order.area} — {order.barangay} | Trouble: {order.trouble_report}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                          DONE
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{order.dateDone || order.date_reported || 'Resolved'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Resolved Trend Line Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Tickets Resolved Trend
          </h3>
          <div className="h-64 w-full pt-2">
            {stats.dailyResolved.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyResolved}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No completion data for selected period
              </div>
            )}
          </div>
        </div>

        {/* Trouble Breakdown Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-400" />
            Trouble Type Breakdown
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {stats.troubleStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.troubleStats}
                    dataKey="count"
                    nameKey="trouble"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ trouble, count }) => `${trouble}: ${count}`}
                  >
                    {stats.troubleStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No trouble data for selected period
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Per-Technician Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          Per-Technician Resolution Leaderboard
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {techStats.map(item => (
            <div key={item.tech} className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-200 truncate">{item.tech}</span>
                <span className="font-mono text-cyan-400 font-bold">{item.resolved} resolved</span>
              </div>
              <p className="text-[11px] text-slate-500">Dispatched: {item.dispatched} | Efficiency: {item.efficiency}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Barangay Geography Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 text-xs">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          Top 10 Barangay Geography Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2">BARANGAY</th>
                <th className="pb-2">AREA</th>
                <th className="pb-2">TOTAL TICKETS</th>
                <th className="pb-2">RESOLVED</th>
                <th className="pb-2">RATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {barangayStats.map(b => (
                <tr key={b.barangay}>
                  <td className="py-2 font-bold text-slate-200">{b.barangay}</td>
                  <td className="py-2 text-slate-400">{b.area}</td>
                  <td className="py-2 text-amber-400">{b.total}</td>
                  <td className="py-2 text-emerald-400">{b.done}</td>
                  <td className="py-2 text-cyan-400 font-bold">{b.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
