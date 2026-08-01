'use client';

import React, { useState } from 'react';
import { ServiceOrder, AppMode } from '../lib/supabase/types';
import { UserContext } from '../lib/domain/rbac';
import { AuditTimelineDrawer } from './AuditTimelineDrawer';
import {
  ClipboardList,
  Box,
  Ticket,
  AlertTriangle,
  MapPin,
  Phone,
  CheckCircle,
  RotateCcw,
  Edit,
  Tag,
  Check,
  History,
  RotateCw
} from 'lucide-react';

interface ServiceOrderCardProps {
  order: ServiceOrder;
  appMode: AppMode;
  user: UserContext | null;
  isRepeatTrouble?: boolean;
  onUpdate: (id: string, updates: Partial<ServiceOrder>) => Promise<void>;
  onEditClick?: (order: ServiceOrder) => void;
  onApproveClick?: (order: ServiceOrder) => void;
  onRescheduleClick?: (order: ServiceOrder) => void;
}

export function ServiceOrderCard({
  order,
  appMode,
  user,
  isRepeatTrouble = false,
  onUpdate,
  onEditClick,
  onApproveClick,
  onRescheduleClick
}: ServiceOrderCardProps) {
  const [techRemarks, setTechRemarks] = useState(order.tech_remarks || '');
  const [isSavingRemarks, setIsSavingRemarks] = useState(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  const isSLI = appMode === 'SLI';
  const isDone = order.status === 'done';
  const isPending = order.status === 'pending';
  const isActive = order.status === 'active';

  const ticketLabel = isSLI ? 'JO No.' : 'Ticket No.';
  const troubleLabel = isSLI ? 'Package' : 'Reported Trouble';
  const TicketIcon = isSLI ? ClipboardList : Ticket;
  const TroubleIcon = isSLI ? Box : AlertTriangle;

  const handleChecklistToggle = async (field: 'pic' | 'pwr' | 'speed' | 'rpt') => {
    const currentValue = order[field] ?? false;
    await onUpdate(order.id, { [field]: !currentValue });
  };

  const handleSaveTechRemarks = async () => {
    if (techRemarks === order.tech_remarks) return;
    setIsSavingRemarks(true);
    try {
      await onUpdate(order.id, { tech_remarks: techRemarks });
    } finally {
      setIsSavingRemarks(false);
    }
  };

  const handleToggleProcessed = async () => {
    const nextVal = !order.is_processed;
    const dateVal = nextVal ? new Date().toISOString() : null;
    await onUpdate(order.id, { is_processed: nextVal, date_processed: dateVal });
  };

  const handleMarkDone = async () => {
    await onUpdate(order.id, {
      status: 'done',
      dateDone: new Date().toLocaleDateString('en-US'),
      completed_at: new Date().toISOString(),
      tech_remarks: techRemarks
    });
  };

  return (
    <>
      <div className={`bg-slate-800/90 border border-slate-700 rounded-xl p-4 shadow-lg hover:border-slate-600 transition-all text-slate-100 flex flex-col justify-between ${order.is_processed ? 'ring-1 ring-emerald-500/40 bg-emerald-950/10' : ''} ${isRepeatTrouble ? 'border-l-4 border-l-rose-500' : ''}`}>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-700/60 pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-lg text-slate-100">{order.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                {order.account_no}
              </span>
              {isRepeatTrouble && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold flex items-center gap-1">
                  <RotateCw className="w-3 h-3" /> REPEAT
                </span>
              )}
              {order.is_processed && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                  <Check className="w-3 h-3" /> PROCESSED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {order.area} {order.barangay ? `— ${order.barangay}` : ''}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono px-2 py-1 rounded bg-slate-900/80 border border-slate-700 text-amber-300 font-bold flex items-center gap-1 justify-end">
              <TicketIcon className="w-3.5 h-3.5" />
              {order.ticket_no || 'N/A'}
            </span>
            <p className="text-xs text-slate-400 mt-1">{order.team || 'Unassigned'}</p>
          </div>
        </div>

        {/* Main Details Body */}
        <div className="space-y-2 text-sm text-slate-300 mb-4">
          <div className="flex items-start gap-2">
            <TroubleIcon className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <span>
              <strong className="text-slate-200">{troubleLabel}:</strong> {order.trouble_report || 'None'}
            </span>
          </div>

          {order.assigned_tech && (
            <div className="text-xs text-cyan-300 font-medium bg-cyan-950/40 p-1.5 rounded border border-cyan-800/60">
              Assigned Tech: <strong>{order.assigned_tech}</strong>
            </div>
          )}

          {order.address && (
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{order.address}</span>
            </div>
          )}

          {order.contact_number && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Phone className="w-3 h-3 shrink-0" />
              <span>{order.contact_number}</span>
            </div>
          )}

          {order.facility && (
            <div className="text-xs text-slate-400 font-mono bg-slate-900/50 p-1.5 rounded border border-slate-800">
              Facility: {order.facility}
            </div>
          )}
        </div>

        {/* Tech Checklist Section */}
        {(isActive || isDone) && (
          <div className="bg-slate-900/70 border border-slate-700/80 rounded-lg p-3 mb-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <span>Field Tech Checklist:</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              {(['pic', 'pwr', 'speed', 'rpt'] as const).map(item => {
                const active = order[item] ?? false;
                return (
                  <button
                    key={item}
                    type="button"
                    disabled={isDone || (user?.role === 'tech' && !isActive)}
                    onClick={() => handleChecklistToggle(item)}
                    className={`py-1 px-2 rounded border text-center font-mono font-semibold transition-all ${
                      active
                        ? 'bg-emerald-900/80 text-emerald-200 border-emerald-600 shadow'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {item.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Tech Remarks */}
            <div className="mt-2">
              <input
                type="text"
                placeholder="Tech remarks / resolution notes..."
                value={techRemarks}
                disabled={isDone}
                onChange={e => setTechRemarks(e.target.value)}
                onBlur={handleSaveTechRemarks}
                className="w-full bg-slate-950 text-slate-100 text-xs px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        )}

        {/* Card Actions Footer */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/60 mt-auto">
          <button
            onClick={() => setIsAuditDrawerOpen(true)}
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
            title="View Audit Trail"
          >
            <History className="w-3.5 h-3.5" /> Log
          </button>

          <div className="flex items-center gap-1.5 flex-wrap">
            {isPending && onApproveClick && (user?.role === 'admin' || user?.role === 'developer') && (
              <button
                onClick={() => onApproveClick(order)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
            )}

            {isActive && (
              <>
                {onRescheduleClick && (
                  <button
                    onClick={() => onRescheduleClick(order)}
                    className="px-2 py-1 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reschedule
                  </button>
                )}
                <button
                  onClick={handleMarkDone}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Mark Done
                </button>
              </>
            )}

            {isDone && (user?.role === 'admin' || user?.role === 'developer') && (
              <button
                onClick={handleToggleProcessed}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  order.is_processed
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                }`}
              >
                <Tag className="w-3 h-3" />
                {order.is_processed ? 'Unprocess' : 'Mark Processed'}
              </button>
            )}

            {onEditClick && (user?.role === 'admin' || user?.role === 'developer') && (
              <button
                onClick={() => onEditClick(order)}
                className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                title="Edit Ticket"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Trail Drawer Modal */}
      <AuditTimelineDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        orderId={order.id}
        ticketNo={order.ticket_no}
        accountName={order.name}
      />
    </>
  );
}
