"use client";

import { useDispatchData } from '@/context/DispatchContext';

interface TeamAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: string | null;
}

export default function TeamAnalyticsModal({ isOpen, onClose, team }: TeamAnalyticsModalProps) {
  const { orders } = useDispatchData();

  if (!isOpen || !team) return null;

  const teamOrders = orders.filter(o => o.team === team);
  const total = teamOrders.length;
  const done = teamOrders.filter(o => o.status === 'done').length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const areaCounts: Record<string, number> = {};
  const history: { date: string, name: string }[] = [];

  teamOrders.forEach(o => {
    if (o.area) areaCounts[o.area] = (areaCounts[o.area] || 0) + 1;
    if (o.status === 'done' && o.dateDone) {
      history.push({ date: o.dateDone, name: o.name });
    }
  });

  const sortedAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh] dark-element">
        <div className="p-6 text-white shrink-0 bg-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-white/70 uppercase">Team Performance</p>
              <h2 className="text-2xl font-bold">{team}</h2>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl font-bold">{percent}%</span>
            <span className="text-sm text-white/70 mb-1">Efficiency</span>
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center dark-bg-sub dark-border">
              <p className="text-xs text-blue-500 font-bold uppercase">Total</p>
              <p className="text-xl font-bold text-blue-700">{total}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-center dark-bg-sub dark-border">
              <p className="text-xs text-green-500 font-bold uppercase">Done</p>
              <p className="text-xl font-bold text-green-700">{done}</p>
            </div>
          </div>
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Top Areas</h4>
          <div className="space-y-1 mb-4">
            {sortedAreas.map(([area, count]) => (
              <div key={area} className="flex justify-between text-sm">
                <span className="text-gray-600 dark-text font-bold">{area}</span>
                <span className="text-gray-400">{count} tickets</span>
              </div>
            ))}
            {sortedAreas.length === 0 && <p className="text-xs text-gray-400 italic">No areas assigned.</p>}
          </div>
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">History</h4>
          <div className="space-y-2 text-sm text-gray-600">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-green-500"><i className="fa-solid fa-check"></i></span>
                <span className="text-gray-400 w-20">{h.date}</span>
                <span className="font-bold truncate dark-text">{h.name}</span>
              </div>
            ))}
            {history.length === 0 && <p className="text-xs text-gray-400 italic">No resolved tickets yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
