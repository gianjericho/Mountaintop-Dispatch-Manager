'use client';

import React from 'react';
import { filterServiceOrders } from '../../../lib/domain/filters';
import { ServiceOrderList } from '../../../components/ServiceOrderList';
import { useAppContext } from '../app-context';
import { History } from 'lucide-react';

export default function HistoryPage() {
  const {
    orders,
    isLoading,
    appMode,
    user,
    filters,
    onUpdateOrder,
    onEditClick
  } = useAppContext();

  // Filter done/completed orders
  const doneOrders = (orders || []).filter(o => o.status === 'done');
  const filteredOrders = filterServiceOrders(doneOrders, filters, user?.role, user?.team);

  const processedCount = filteredOrders.filter(o => o.is_processed).length;
  const unprocessedCount = filteredOrders.length - processedCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-400" />
            Completed Ticket History ({appMode})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Historical archive of resolved service tickets. Dispatchers can toggle Done-Processed tags to organize reviewed tech reports.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="text-slate-400">Total Done: <strong className="text-slate-200">{filteredOrders.length}</strong></span>
          <span className="text-slate-700">|</span>
          <span className="text-emerald-400">Processed: <strong>{processedCount}</strong></span>
          <span className="text-slate-700">|</span>
          <span className="text-amber-400">Unprocessed: <strong>{unprocessedCount}</strong></span>
        </div>
      </div>

      <ServiceOrderList
        orders={filteredOrders}
        appMode={appMode}
        user={user}
        isLoading={isLoading}
        onUpdateOrder={onUpdateOrder}
        onEditClick={onEditClick}
      />
    </div>
  );
}
