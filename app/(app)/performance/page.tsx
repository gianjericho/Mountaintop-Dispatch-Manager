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
  Award
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
  const [period, setPeriod] = useState<'thisMonth' | 'lastMonth' | 'all'>('thisMonth');

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
  }

  // Filter orders by mode
  const modeOrders = (orders || []).filter(o => o.type === appMode);
  const stats = calculatePerformanceStats(modeOrders, startDate, endDate);

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
            Real-time technician efficiency, trouble type breakdown, and monthly completion trends.
          </p>
        </div>

        {/* Period Selector */}
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
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              period === 'all' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Efficiency */}
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

        {/* Total Dispatched */}
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

        {/* Total Resolved */}
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

      {/* Per-Team Stat Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          Per-Team Performance Metrics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.keys(stats.teamStats).map(teamName => {
            const team = stats.teamStats[teamName];
            return (
              <div key={teamName} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-sm">{teamName}</span>
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
