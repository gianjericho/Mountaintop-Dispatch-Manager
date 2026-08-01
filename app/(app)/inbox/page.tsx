'use client';

import React, { useState } from 'react';
import { ServiceOrder } from '../../../lib/supabase/types';
import { filterServiceOrders } from '../../../lib/domain/filters';
import { ServiceOrderList } from '../../../components/ServiceOrderList';
import { useAppContext } from '../app-context';
import { Inbox, CheckCircle } from 'lucide-react';

export default function InboxPage() {
  const {
    orders,
    isLoading,
    appMode,
    user,
    filters,
    onUpdateOrder,
    onEditClick,
    availableTeams
  } = useAppContext();

  const [approveOrderTarget, setApproveOrderTarget] = useState<ServiceOrder | null>(null);
  const [assignTeam, setAssignTeam] = useState<string>('Unassigned');

  // Filter for pending tickets
  const pendingOrders = (orders || []).filter(o => o.status === 'pending');
  const filteredOrders = filterServiceOrders(pendingOrders, filters, user?.role, user?.team);

  const handleApproveSubmit = async () => {
    if (!approveOrderTarget) return;
    await onUpdateOrder(approveOrderTarget.id, {
      status: 'active',
      team: assignTeam,
      dateAdded: new Date().toLocaleDateString('en-US'),
      dispatched_by: user?.email
    });
    setApproveOrderTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-amber-400" />
            Inbox — Pending Ticket Queue ({appMode})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            New tickets arriving from monitoring sheets via Google Apps Script bridge. Assign team and approve to dispatch.
          </p>
        </div>
      </div>

      <ServiceOrderList
        orders={filteredOrders}
        appMode={appMode}
        user={user}
        isLoading={isLoading}
        onUpdateOrder={onUpdateOrder}
        onEditClick={onEditClick}
        onApproveClick={(order) => {
          setApproveOrderTarget(order);
          setAssignTeam(order.team || availableTeams[0] || 'Unassigned');
        }}
      />

      {/* Approval & Team Assignment Modal */}
      {approveOrderTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Approve & Assign Ticket
            </h3>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
              <p className="font-semibold text-slate-200">{approveOrderTarget.name}</p>
              <p className="text-slate-400 font-mono">Account: {approveOrderTarget.account_no} | Ticket: {approveOrderTarget.ticket_no}</p>
              <p className="text-slate-400">Trouble: {approveOrderTarget.trouble_report}</p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Select Team to Dispatch:</label>
              <select
                value={assignTeam}
                onChange={e => setAssignTeam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Unassigned">Unassigned</option>
                {availableTeams.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setApproveOrderTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveSubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Approve Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
