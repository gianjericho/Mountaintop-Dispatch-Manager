'use client';

import React from 'react';
import { UserRole } from '../lib/supabase/types';
import { UserCheck, ShieldAlert, X } from 'lucide-react';

interface DevImpersonationBarProps {
  currentRole: UserRole;
  currentTeam: string | null;
  isImpersonating: boolean;
  onSetImpersonation: (role: UserRole | null, team: string | null) => void;
  availableTeams: string[];
}

export function DevImpersonationBar({
  currentRole,
  currentTeam,
  isImpersonating,
  onSetImpersonation,
  availableTeams
}: DevImpersonationBarProps) {
  return (
    <div className="bg-amber-950/80 border-b border-amber-800 text-amber-200 px-4 py-2 text-xs flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-semibold">Dev Impersonation Toolbar:</span>
        <span className="opacity-90">
          Role: <strong className="uppercase font-mono text-amber-300">{currentRole}</strong>
          {currentTeam && ` | Team: `}
          {currentTeam && <strong className="font-mono text-amber-300">{currentTeam}</strong>}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-amber-300 font-medium">Switch Role:</label>
        <select
          value={currentRole}
          onChange={e => {
            const r = e.target.value as UserRole;
            onSetImpersonation(r, currentTeam);
          }}
          className="bg-amber-900/90 border border-amber-700 text-amber-100 rounded px-2 py-1 text-xs focus:outline-none"
        >
          <option value="developer">Developer</option>
          <option value="admin">Admin</option>
          <option value="tech">Field Tech</option>
        </select>

        {currentRole === 'tech' && (
          <select
            value={currentTeam || ''}
            onChange={e => onSetImpersonation(currentRole, e.target.value || null)}
            className="bg-amber-900/90 border border-amber-700 text-amber-100 rounded px-2 py-1 text-xs focus:outline-none"
          >
            <option value="">Select Team...</option>
            {availableTeams.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}

        {isImpersonating && (
          <button
            onClick={() => onSetImpersonation(null, null)}
            className="ml-2 px-2 py-1 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
