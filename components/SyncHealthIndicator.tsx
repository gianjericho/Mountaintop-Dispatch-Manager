'use client';

import React, { useState } from 'react';
import { SyncHealthModal } from './modals/SyncHealthModal';
import { Activity } from 'lucide-react';

export function SyncHealthIndicator() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-[11px] font-medium text-slate-300 transition-colors"
        title="View Google Apps Script Bridge Sync Health"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <Activity className="w-3.5 h-3.5 text-cyan-400" />
        <span>Bridge Active</span>
      </button>

      <SyncHealthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
