import { ServiceOrder } from '../supabase/types';
import { parseSafeDate } from './dates';

export interface PerformanceStats {
  totalDispatched: number;
  totalResolved: number;
  efficiencyRate: number;
  teamStats: { [teamName: string]: { dispatched: number; resolved: number; efficiency: number } };
  troubleStats: { trouble: string; count: number }[];
  dailyResolved: { date: string; count: number }[];
}

export function calculatePerformanceStats(
  orders: ServiceOrder[],
  startDate: Date | null,
  endDate: Date | null
): PerformanceStats {
  const filtered = orders.filter(order => {
    const orderDate = parseSafeDate(order.dateDone || order.dateAdded || order.date_reported);
    if (!orderDate) return true;

    if (startDate && orderDate < startDate) return false;
    if (endDate && orderDate > endDate) return false;

    return true;
  });

  const totalDispatched = filtered.length;
  const resolvedOrders = filtered.filter(o => o.status === 'done');
  const totalResolved = resolvedOrders.length;
  const efficiencyRate = totalDispatched > 0 ? Math.round((totalResolved / totalDispatched) * 100) : 0;

  // Per-team stats
  const teamMap: { [team: string]: { dispatched: number; resolved: number } } = {};
  filtered.forEach(o => {
    const team = o.team ? o.team.trim() : 'Unassigned';
    if (!teamMap[team]) teamMap[team] = { dispatched: 0, resolved: 0 };
    teamMap[team].dispatched++;
    if (o.status === 'done') teamMap[team].resolved++;
  });

  const teamStats: { [teamName: string]: { dispatched: number; resolved: number; efficiency: number } } = {};
  Object.keys(teamMap).forEach(team => {
    const d = teamMap[team].dispatched;
    const r = teamMap[team].resolved;
    const eff = d > 0 ? Math.round((r / d) * 100) : 0;
    teamStats[team] = { dispatched: d, resolved: r, efficiency: eff };
  });

  // Trouble type breakdown
  const troubleMap: { [trouble: string]: number } = {};
  resolvedOrders.forEach(o => {
    const t = o.trouble_report ? o.trouble_report.trim().toUpperCase() : 'UNKNOWN';
    troubleMap[t] = (troubleMap[t] || 0) + 1;
  });

  const troubleStats = Object.keys(troubleMap)
    .map(trouble => ({ trouble, count: troubleMap[trouble] }))
    .sort((a, b) => b.count - a.count);

  // Daily resolved trend
  const dailyMap: { [dateStr: string]: number } = {};
  resolvedOrders.forEach(o => {
    const d = parseSafeDate(o.dateDone || o.dateAdded);
    const dateKey = d ? `${d.getMonth() + 1}/${d.getDate()}` : 'Other';
    dailyMap[dateKey] = (dailyMap[dateKey] || 0) + 1;
  });

  const dailyResolved = Object.keys(dailyMap)
    .map(date => ({ date, count: dailyMap[date] }));

  return {
    totalDispatched,
    totalResolved,
    efficiencyRate,
    teamStats,
    troubleStats,
    dailyResolved
  };
}
