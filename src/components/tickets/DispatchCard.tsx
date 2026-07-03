"use client";

import { ServiceOrder } from '@/services/dispatchService';
import { useAuth } from '@/components/auth/AuthProvider';

interface DispatchCardProps {
  order: ServiceOrder;
  onEdit: (order: ServiceOrder) => void;
  onDelete: (id: number) => void;
  onMarkDone: (id: number) => void;
  onReschedule: (id: number) => void;
  onDispatch: (id: number) => void;
}

export default function DispatchCard({ order, onEdit, onDelete, onMarkDone, onReschedule, onDispatch }: DispatchCardProps) {
  const { user } = useAuth();
  const role = user?.role || 'tech';
  
  const isHistory = order.status === 'done';
  const isPending = order.status === 'pending';
  const isActive = order.status === 'active';

  let statusBadgeClass = "bg-gray-100 text-gray-500 border-gray-200";
  let statusIcon = "fa-clock";
  let statusText = "Pending";
  
  if (isActive) {
    statusBadgeClass = "bg-green-50 text-green-600 border-green-200";
    statusIcon = "fa-bolt";
    statusText = "Active";
  } else if (isHistory) {
    statusBadgeClass = "bg-blue-50 text-blue-600 border-blue-200";
    statusIcon = "fa-check-circle";
    statusText = "Done";
  }

  const getAgingDays = (dateStr: string | null) => {
    if (!dateStr) return 0;
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 3600 * 24));
  };

  const agingDays = isActive ? getAgingDays(order.dateAdded) : 0;
  const isAging = agingDays >= 3;

  return (
    <div className={`bg-white p-4 rounded-xl shadow-sm border ${isAging ? 'border-red-300 shadow-red-50' : 'border-gray-100'} flex flex-col gap-2 dark-element dark-border transition-all`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h3 className="font-bold text-gray-800 text-sm md:text-base dark-text uppercase">{order.name}</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-0.5">
            <i className="fa-solid fa-map-location-dot mr-1"></i>{order.area} - {order.barangay}
          </p>
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${statusBadgeClass} whitespace-nowrap flex items-center`}>
          <i className={`fa-solid ${statusIcon} mr-1`}></i> {statusText}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100 dark-bg-sub dark-border">
        {order.ticket && (
          <div className="flex items-center text-xs text-gray-600">
            <i className="fa-solid fa-hashtag text-gray-400 mr-1.5 w-3 text-center"></i>
            <span className="font-bold">{order.ticket}</span>
          </div>
        )}
        {order.account && (
          <div className="flex items-center text-xs text-gray-600">
            <i className="fa-solid fa-user-tag text-gray-400 mr-1.5 w-3 text-center"></i>
            <span className="font-bold">{order.account}</span>
          </div>
        )}
        {order.contact && (
          <div className="flex items-center text-xs text-gray-600">
            <i className="fa-solid fa-phone text-gray-400 mr-1.5 w-3 text-center"></i>
            <span>{order.contact}</span>
          </div>
        )}
        <div className="flex items-center text-xs text-gray-600">
          <i className="fa-solid fa-users-gear text-gray-400 mr-1.5 w-3 text-center"></i>
          <span className="font-bold text-blue-600">{order.team}</span>
        </div>
      </div>

      {(order.address || order.trouble || order.remarks) && (
        <div className="mt-2 space-y-1.5 border-t border-gray-100 dark-border pt-2">
          {order.address && (
            <p className="text-xs text-gray-500 flex items-start">
              <i className="fa-solid fa-location-dot text-gray-400 mr-1.5 mt-0.5 w-3 text-center"></i>
              <span className="flex-1">{order.address}</span>
            </p>
          )}
          {order.trouble && (
            <p className="text-xs text-red-500 flex items-start font-bold">
              <i className="fa-solid fa-triangle-exclamation text-red-400 mr-1.5 mt-0.5 w-3 text-center"></i>
              <span className="flex-1">{order.trouble}</span>
            </p>
          )}
          {order.remarks && (
            <p className="text-xs text-purple-600 flex items-start italic bg-purple-50 p-1.5 rounded border border-purple-100 dark-bg-sub dark-border">
              <i className="fa-solid fa-comment-dots text-purple-400 mr-1.5 mt-0.5 w-3 text-center"></i>
              <span className="flex-1">Dispatcher: {order.remarks}</span>
            </p>
          )}
          {order.tech_remarks && (
            <p className="text-xs text-green-600 flex items-start italic bg-green-50 p-1.5 rounded border border-green-100 dark-bg-sub dark-border">
              <i className="fa-solid fa-reply text-green-400 mr-1.5 mt-0.5 w-3 text-center"></i>
              <span className="flex-1">Tech: {order.tech_remarks}</span>
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark-border">
        {(role === 'developer' || role === 'admin') && isPending && (
          <button onClick={() => onDelete(order.id!)} className="text-xs text-red-500 font-bold hover:bg-red-50 px-2 py-1.5 rounded transition">
            <i className="fa-solid fa-trash mr-1"></i>Delete
          </button>
        )}
        
        {(role === 'developer' || role === 'admin') && (isPending || isActive) && (
          <button onClick={() => onEdit(order)} className="text-xs text-blue-500 font-bold hover:bg-blue-50 px-2 py-1.5 rounded transition">
            <i className="fa-solid fa-pen-to-square mr-1"></i>Edit
          </button>
        )}

        {(role === 'developer' || role === 'admin') && isPending && (
          <button onClick={() => onDispatch(order.id!)} className="text-xs text-white bg-green-600 hover:bg-green-700 font-bold px-3 py-1.5 rounded shadow-sm transition ml-auto">
            <i className="fa-solid fa-paper-plane mr-1"></i>Dispatch
          </button>
        )}

        {isActive && (
          <>
            <button onClick={() => onReschedule(order.id!)} className="text-xs text-orange-500 font-bold hover:bg-orange-50 px-2 py-1.5 rounded transition">
              <i className="fa-solid fa-rotate-left mr-1"></i>Reschedule
            </button>
            <button onClick={() => onMarkDone(order.id!)} className="text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold px-3 py-1.5 rounded shadow-sm transition ml-auto">
              <i className="fa-solid fa-check-double mr-1"></i>Mark Done
            </button>
          </>
        )}
        
        {isHistory && (
          <div className="text-xs text-gray-400 italic">Resolved on {order.dateDone}</div>
        )}
      </div>
    </div>
  );
}
