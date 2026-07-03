"use client";

import { ServiceOrder } from '@/services/dispatchService';
import { useAuth } from '@/components/auth/AuthProvider';

interface DispatchCardProps {
  order: ServiceOrder;
  appMode: string;
  onEdit: (order: ServiceOrder) => void;
  onDelete: (id: number) => void;
  onMarkDone: (id: number) => void;
  onReschedule: (id: number) => void;
  onDispatch: (id: number) => void;
  onUpdateRemarks: (id: number, field: 'remarks' | 'tech_remarks', value: string) => void;
  onToggleCheck: (id: number, field: string, value: boolean) => void;
}

export default function DispatchCard({ 
  order, 
  appMode,
  onEdit, 
  onDelete, 
  onMarkDone, 
  onReschedule, 
  onDispatch,
  onUpdateRemarks,
  onToggleCheck
}: DispatchCardProps) {
  const { user } = useAuth();
  const currentUserRole = user?.role || 'tech';
  
  const isSLR = appMode === 'SLR';
  const isPending = order.status === 'pending';
  const isDone = order.status === 'done';
  const isActive = order.status === 'active';

  // Dynamic styles based on team
  let borderColor = 'border-gray-300';
  let teamColorClass = 'text-gray-500';
  const lTeam = (order.team || '').toLowerCase();
  
  if (lTeam.includes('installer')) { borderColor = 'border-green-500'; teamColorClass = 'text-green-600'; }
  else if (lTeam.includes('repair')) { borderColor = 'border-indigo-500'; teamColorClass = 'text-indigo-600'; }
  else if (lTeam.includes('splicer')) { borderColor = 'border-orange-500'; teamColorClass = 'text-orange-600'; }
  else if (lTeam.includes('puller')) { borderColor = 'border-yellow-500'; teamColorClass = 'text-yellow-600'; }
  else if (lTeam.includes('survey')) { borderColor = 'border-cyan-500'; teamColorClass = 'text-cyan-600'; }

  // Dynamic Icon matching
  const color = isSLR ? 'green' : 'indigo';
  const ticketIcon = isSLR ? 'fa-ticket' : 'fa-clipboard-list';
  const ticketLabel = isSLR ? 'Ticket No' : 'JO Number';
  const troubleIcon = isSLR ? 'fa-triangle-exclamation' : 'fa-clipboard-question';
  const troubleLabel = isSLR ? 'Trouble' : 'Job Type';
  const troubleColor = isSLR ? 'text-red-500' : 'text-blue-500';

  const reportedDateDisplay = order.date_reported 
    ? new Date(order.date_reported).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    : 'No Date';

  let agingBadge = null;
  if (order.dateAdded && !isDone && !isPending) {
      const diff = new Date().getTime() - new Date(order.dateAdded).getTime();
      const days = Math.floor(diff / (1000 * 3600 * 24));
      if (days >= 3) {
          agingBadge = <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded shadow-sm border border-red-200 animate-pulse">{days} DAYS OLD</span>;
      } else if (days >= 1) {
          agingBadge = <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded shadow-sm border border-orange-200">1 DAY OLD</span>;
      }
  }

  const hoverColorClass = isSLR ? 'hover:text-green-600' : 'hover:text-indigo-600';
  const bgColorClass = isSLR ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700';
  const focusRingClass = isSLR ? 'focus:ring-green-500/20 focus:border-green-500' : 'focus:ring-indigo-500/20 focus:border-indigo-500';
  const accentColorClass = isSLR ? 'accent-green-600' : 'accent-indigo-600';

  return (
    <div className={`service-order-card bg-white rounded-xl shadow-sm p-4 border-l-4 ${borderColor} mb-3 dark-element`}>
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-start gap-2">
          {isPending && (
            <input type="checkbox" className="pending-cb w-4 h-4 mt-0.5 accent-blue-600 cursor-pointer rounded" value={order.id} />
          )}
          <div>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded mb-1 inline-block border border-slate-200 dark-bg-sub dark-text dark-border">
              {order.area}{order.barangay ? ` • ${order.barangay}` : ''}
            </span>
            <h3 className="font-bold text-gray-800 text-lg leading-tight dark-text">{order.name}</h3>
            <p className={`text-xs ${teamColorClass} mt-0.5 uppercase tracking-wide dark-text`}>{order.team}</p>
            <div className="text-[10px] text-gray-400 mt-1 tracking-wider">
              <i className="fa-solid fa-headset mr-1"></i> Dispatched by: {order.dispatched_by || 'Unknown'}
            </div>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(order)} className={`text-gray-300 ${hoverColorClass} p-1`}>
            <i className="fa-solid fa-pen"></i>
          </button>
          {!isPending && !isDone && ['admin', 'developer'].includes(currentUserRole) && (
            <button onClick={() => onReschedule(order.id!)} className="text-gray-300 hover:text-amber-500 p-1" title="Reschedule (Return to Inbox)">
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          )}
          {['admin', 'developer'].includes(currentUserRole) && (
            <button onClick={() => onDelete(order.id!)} className="text-gray-300 hover:text-red-500 p-1">
              <i className="fa-solid fa-trash"></i>
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 mb-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 dark-bg-sub dark-text dark-border">
        <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 mb-1.5 dark-border">
          <span className="font-bold text-slate-700 dark-text text-[11px]">
            <i className={`fa-solid ${ticketIcon} text-slate-400 mr-1`}></i>{ticketLabel}: {order.ticket || 'No Ticket'}
            <span className="ml-1 font-mono text-slate-500 font-normal">({order.account || 'No Acct'})</span>
          </span>
          <div className="flex items-center gap-1">
            {agingBadge}
            <span className="font-mono text-[9px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-100 dark-element dark-border" title="Date Reported">
              <i className="fa-regular fa-calendar mr-1"></i>{reportedDateDisplay}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-start mb-1.5">
          <div className="font-medium flex-1 break-words leading-tight" title={order.address || ''}>
            <i className="fa-solid fa-location-dot mr-1.5 text-slate-400"></i>{order.address || 'No Address Provided'}
          </div>
          {order.map_link && (
            <a href={order.map_link} target="_blank" className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition whitespace-nowrap font-bold">
              <i className="fa-solid fa-map-location-dot mr-1"></i>Map
            </a>
          )}
        </div>
        
        {/* Skipping extra notes mapping since legacy `item.notes` doesn't match our DB perfectly, but assuming `order.notes` exists */}
        
        <div className="flex items-center mt-1.5 mb-1.5">
          <i className="fa-solid fa-phone mr-1.5 text-slate-400"></i>
          <span className="font-medium">{order.contact || 'No Contact'}</span>
        </div>
        
        {order.facility && (
          <div className="flex items-center mt-1 mb-1">
            <i className="fa-solid fa-tower-broadcast mr-1.5 text-slate-400"></i>
            <span className="font-medium text-slate-500">{order.facility}</span>
          </div>
        )}
        
        {order.trouble && (
          <div className={`mt-2 pt-1.5 border-t border-slate-200 dark-border ${troubleColor} font-bold flex items-start`}>
            <i className={`fa-solid ${troubleIcon} mt-0.5 mr-1.5`}></i>
            <span className="leading-tight">{troubleLabel}: {order.trouble}</span>
          </div>
        )}
      </div>

      {!isPending && (
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg dark-bg-sub dark-text">
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={!!order.pic} onChange={(e) => onToggleCheck(order.id!, 'pic', e.target.checked)} disabled={isDone} className={accentColorClass} />
            <span>Trouble Pic</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={!!order.pwr} onChange={(e) => onToggleCheck(order.id!, 'pwr', e.target.checked)} disabled={isDone} className={accentColorClass} />
            <span>Optical Pwr</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={!!order.speed} onChange={(e) => onToggleCheck(order.id!, 'speed', e.target.checked)} disabled={isDone} className={accentColorClass} />
            <span>Speedtest</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={!!order.rpt} onChange={(e) => onToggleCheck(order.id!, 'rpt', e.target.checked)} disabled={isDone} className={accentColorClass} />
            <span>Service Rpt</span>
          </label>
        </div>
      )}

      {(order.remarks || (currentUserRole !== 'tech' && !isPending && !isDone)) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2.5 mb-2.5 rounded-r shadow-sm dark-bg-sub dark-border text-left">
          <span className="text-[9px] font-extrabold text-yellow-700 uppercase tracking-widest mb-0.5 block">
            <i className="fa-solid fa-user-shield mr-1"></i> Dispatcher Note
          </span>
          <span className="text-xs text-yellow-800 dark-text font-medium">{order.remarks || 'No remarks provided'}</span>
        </div>
      )}
      
      {(order.tech_remarks && (currentUserRole !== 'tech' || isDone)) && (
        <div className="bg-indigo-50 border-l-4 border-indigo-400 p-2.5 mb-2.5 rounded-r shadow-sm dark-bg-sub dark-border text-left">
          <span className="text-[9px] font-extrabold text-indigo-700 uppercase tracking-widest mb-0.5 block">
            <i className="fa-solid fa-wrench mr-1"></i> Technician Note
          </span>
          <span className="text-xs text-indigo-800 dark-text font-medium">{order.tech_remarks}</span>
        </div>
      )}

      {!isDone ? (
        (currentUserRole !== 'tech' && !isPending) ? null : (
          <div className="flex items-center justify-between gap-3 mt-3 border-t border-slate-100 pt-3 dark-border">
            <input 
              type="text" 
              defaultValue={currentUserRole === 'tech' ? (order.tech_remarks || '') : (order.remarks || '')} 
              onBlur={(e) => onUpdateRemarks(order.id!, currentUserRole === 'tech' ? 'tech_remarks' : 'remarks', e.target.value)}
              placeholder={currentUserRole === 'tech' ? 'Add technician remarks' : 'Add dispatch remarks'} 
              className={`flex-1 bg-slate-50 text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none dark-input focus:ring-2 transition-all font-medium text-slate-700 placeholder-slate-400 ${focusRingClass}`} 
            />
            {isPending ? (
              <button onClick={() => onDispatch(order.id!)} className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition flex items-center whitespace-nowrap">
                <i className="fa-solid fa-paper-plane mr-1.5"></i>Dispatch
              </button>
            ) : (
              <button onClick={() => onMarkDone(order.id!)} className={`${bgColorClass} text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition flex items-center whitespace-nowrap`}>
                <i className="fa-solid fa-check-double mr-1.5"></i>Mark Done
              </button>
            )}
          </div>
        )
      ) : (
        <div className="flex justify-end mt-2 pb-1 border-t border-slate-100 pt-2 dark-border">
          <span className="text-xs font-bold text-slate-400 italic flex items-center">
            <i className="fa-solid fa-check-circle mr-1"></i>Resolved {order.dateDone || ''}
          </span>
        </div>
      )}
    </div>
  );
}
