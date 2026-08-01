'use client';

import React, { useState, useEffect } from 'react';
import { fetchSyncLogs } from '../../lib/data/serviceOrders';
import { SyncLog } from '../../lib/supabase/types';
import { Activity, X, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface SyncHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SyncHealthModal({ isOpen, onClose }: SyncHealthModalProps) {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    fetchSyncLogs().then(data => {
      if (isMounted) {
        setLogs(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const latestPush = logs.find(l => l.direction === 'push');
  const latestPull = logs.find(l => l.direction === 'pull');

  const getTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffMins = Math.floor((Date.now() - d.getTime()) / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour(s) ago`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Google Apps Script Bridge — Sync Health & Heartbeat
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Status Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Push Bridge (Sheet → DB)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-slate-400">
              Last Run: <strong className="text-slate-200">{latestPush ? getTimeAgo(latestPush.ran_at) : 'Never'}</strong>
            </p>
            {latestPush && (
              <p className="text-slate-500 font-mono text-[10px]">Rows Pushed: {latestPush.rows_affected}</p>
            )}
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Pull Bridge (DB → Sheet)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-slate-400">
              Last Run: <strong className="text-slate-200">{latestPull ? getTimeAgo(latestPull.ran_at) : 'Never'}</strong>
            </p>
            {latestPull && (
              <p className="text-slate-500 font-mono text-[10px]">Rows Synced: {latestPull.rows_affected}</p>
            )}
          </div>
        </div>

        {/* Log History List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-300">Recent Sync Log Execution History:</h4>
          {isLoading ? (
            <div className="py-6 text-center text-slate-500 animate-pulse">Loading sync logs...</div>
          ) : logs.length === 0 ? (
            <div className="py-6 text-center text-slate-500">No sync logs recorded yet.</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {logs.map(log => {
                const isError = !!log.error_text || log.rows_failed > 0;
                return (
                  <div key={log.id} className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      {isError ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span className="uppercase text-slate-300 font-bold">{log.direction}</span>
                      <span className="text-slate-400">({log.rows_affected} affected)</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">{getTimeAgo(log.ran_at)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
