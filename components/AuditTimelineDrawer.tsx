'use client';

import React, { useState, useEffect } from 'react';
import { fetchOrderEvents } from '../lib/data/serviceOrders';
import { ServiceOrderEvent } from '../lib/supabase/types';
import { History, X, Clock, User, ArrowRight } from 'lucide-react';

interface AuditTimelineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  ticketNo: string;
  accountName: string;
}

export function AuditTimelineDrawer({
  isOpen,
  onClose,
  orderId,
  ticketNo,
  accountName
}: AuditTimelineDrawerProps) {
  const [events, setEvents] = useState<ServiceOrderEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    let isMounted = true;
    setIsLoading(true);

    fetchOrderEvents(orderId).then(data => {
      if (isMounted) {
        setEvents(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Audit Trail — Ticket #{ticketNo}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-300 font-medium">{accountName}</p>

        {isLoading ? (
          <div className="py-8 text-center text-slate-500 animate-pulse">Loading audit history...</div>
        ) : events.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No logged events found for this ticket yet.</div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {events.map((evt) => {
              const formattedDate = new Date(evt.at).toLocaleString();
              return (
                <div key={evt.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 uppercase font-mono">{evt.action}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formattedDate}
                    </span>
                  </div>

                  {evt.field && (
                    <p className="text-slate-400">
                      Field: <span className="text-slate-200 font-mono">{evt.field}</span>
                    </p>
                  )}

                  {(evt.old_value || evt.new_value) && (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="line-through text-slate-500">{evt.old_value || 'none'}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-emerald-400 font-medium">{evt.new_value || 'none'}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Source: <strong className="text-slate-400">{evt.source}</strong></span>
                    {evt.actor_email && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <User className="w-3 h-3" /> {evt.actor_email}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
