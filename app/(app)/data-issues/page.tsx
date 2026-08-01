'use client';

import React, { useState } from 'react';
import { ServiceOrder } from '../../../lib/supabase/types';
import { useAppContext } from '../app-context';
import { checkDuplicateKey } from '../../../lib/domain/duplicates';
import { getRepeatTroubleAccounts } from '../../../lib/domain/repeatTroubles';
import { ShieldAlert, AlertTriangle, CheckCircle, Tag, Users, Shield } from 'lucide-react';

export default function DataIssuesPage() {
  const { orders, isLoading, appMode, onUpdateOrder, availableTeams } = useAppContext();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const modeOrders = (orders || []).filter(o => o.type === appMode);

  // 1. Detect Duplicates
  const duplicates: ServiceOrder[] = [];
  const seenMap = new Map<string, ServiceOrder>();

  modeOrders.forEach(o => {
    const key = `${o.type}|${(o.ticket_no || '').trim().toLowerCase()}|${(o.account_no || '').trim().toLowerCase()}|${(o.date_reported || '').trim()}`;
    if (o.ticket_no && o.account_no) {
      if (seenMap.has(key)) {
        duplicates.push(o);
      } else {
        seenMap.set(key, o);
      }
    }
  });

  // 2. Active with no team
  const unassignedActive = modeOrders.filter(o => o.status === 'active' && (!o.team || o.team === 'Unassigned'));

  // 3. Stale Pending (>3 days)
  const now = Date.now();
  const stalePending = modeOrders.filter(o => {
    if (o.status !== 'pending') return false;
    const d = new Date(o.date_reported || o.dateAdded || Date.now());
    return (now - d.getTime()) > (1000 * 3600 * 24 * 3);
  });

  // 4. Aged Unprocessed (>7 days done)
  const agedUnprocessed = modeOrders.filter(o => {
    if (o.status !== 'done' || o.is_processed) return false;
    const d = new Date(o.dateDone || o.dateAdded || Date.now());
    return (now - d.getTime()) > (1000 * 3600 * 24 * 7);
  });

  // 5. Repeat Trouble Accounts
  const repeatSet = getRepeatTroubleAccounts(modeOrders, 30);
  const repeatOrders = modeOrders.filter(o => repeatSet.has((o.account_no || '').trim().toLowerCase()));

  const handleRelabelDuplicate = async (order: ServiceOrder) => {
    setResolvingId(order.id);
    try {
      const newTicketNo = `${order.ticket_no} (dup)`;
      await onUpdateOrder(order.id, { ticket_no: newTicketNo });
    } finally {
      setResolvingId(null);
    }
  };

  const handleAssignTeam = async (order: ServiceOrder, team: string) => {
    setResolvingId(order.id);
    try {
      await onUpdateOrder(order.id, { team });
    } finally {
      setResolvingId(null);
    }
  };

  const handleProcessTicket = async (order: ServiceOrder) => {
    setResolvingId(order.id);
    try {
      await onUpdateOrder(order.id, { is_processed: true, date_processed: new Date().toISOString() });
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            Data Quality & Issues Dashboard ({appMode})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit system data for duplicates, unassigned active dispatches, stale pending tickets, and aged unprocessed reports.
          </p>
        </div>

        <div className="bg-amber-950/60 border border-amber-800 text-amber-300 text-xs px-3 py-1.5 rounded-lg font-mono">
          Strict Policy: Relabel & Flag Only — Never Delete Rows
        </div>
      </div>

      {/* Overview Issue Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400">Duplicates Detected</p>
          <h3 className="text-2xl font-black text-rose-400 mt-1">{duplicates.length}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400">Unassigned Active</p>
          <h3 className="text-2xl font-black text-amber-400 mt-1">{unassignedActive.length}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400">Stale Pending (&gt;3d)</p>
          <h3 className="text-2xl font-black text-cyan-400 mt-1">{stalePending.length}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400">Repeat Accounts (30d)</p>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">{repeatSet.size}</h3>
        </div>
      </div>

      {/* Duplicates Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 text-xs">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Duplicate Tickets ({duplicates.length})
        </h3>

        {duplicates.length === 0 ? (
          <p className="text-slate-500 py-2">✅ No duplicate tickets detected.</p>
        ) : (
          <div className="space-y-2">
            {duplicates.map(order => (
              <div key={order.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-slate-200">{order.name}</span>
                  <span className="text-slate-400 ml-2 font-mono">Account: {order.account_no} | Ticket: {order.ticket_no}</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">Area: {order.area} | Date: {order.date_reported}</p>
                </div>
                <button
                  disabled={resolvingId === order.id}
                  onClick={() => handleRelabelDuplicate(order)}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white rounded font-medium transition-colors shrink-0"
                >
                  Relabel Duplicate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unassigned Active Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 text-xs">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          Active Dispatches Missing Team ({unassignedActive.length})
        </h3>

        {unassignedActive.length === 0 ? (
          <p className="text-slate-500 py-2">✅ All active tickets are assigned to teams.</p>
        ) : (
          <div className="space-y-2">
            {unassignedActive.map(order => (
              <div key={order.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-slate-200">{order.name}</span>
                  <span className="text-slate-400 ml-2 font-mono">Ticket: {order.ticket_no}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue=""
                    disabled={resolvingId === order.id}
                    onChange={e => {
                      if (e.target.value) handleAssignTeam(order, e.target.value);
                    }}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
                  >
                    <option value="">Assign Team...</option>
                    {availableTeams.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
