'use client';

import React, { useState } from 'react';
import { ServiceOrder } from '../../../lib/supabase/types';
import { filterServiceOrders } from '../../../lib/domain/filters';
import { ServiceOrderList } from '../../../components/ServiceOrderList';
import { useAppContext } from '../app-context';
import { Send, RotateCcw } from 'lucide-react';

export default function DispatchedPage() {
  const {
    orders,
    isLoading,
    appMode,
    user,
    filters,
    onUpdateOrder,
    onEditClick
  } = useAppContext();

  const [rescheduleOrderTarget, setRescheduleOrderTarget] = useState<ServiceOrder | null>(null);

  // Filter active/dispatched orders
  const activeOrders = (orders || []).filter(o => o.status === 'active');
  const filteredOrders = filterServiceOrders(activeOrders, filters, user?.role, user?.team);

  const handleRescheduleSubmit = async () => {
    if (!rescheduleOrderTarget) return;
    await onUpdateOrder(rescheduleOrderTarget.id, {
      status: 'pending',
      dateAdded: null
    });
    setRescheduleOrderTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Send className="w-6 h-6 text-cyan-400" />
            Dispatched Field Operations ({appMode})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Active service orders currently assigned to field technician teams. Update checklist items and mark done upon completion.
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
        onRescheduleClick={(order) => setRescheduleOrderTarget(order)}
      />

      {/* Reschedule Confirmation Modal */}
      {rescheduleOrderTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              Reschedule Service Order
            </h3>

            <p className="text-slate-300">
              Are you sure you want to reschedule <strong>{rescheduleOrderTarget.name}</strong>? This ticket will return to the <strong>Inbox</strong> (pending status) for re-assignment.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setRescheduleOrderTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Return to Pending
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
