'use client';

import React, { useState } from 'react';
import { reassignTeamOrders } from '../../lib/data/serviceOrders';
import { X, Users, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTeams: string[];
  onTeamListChange?: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  availableTeams,
  onTeamListChange
}: SettingsModalProps) {
  const [selectedTeam, setSelectedTeam] = useState(availableTeams[0] || '');
  const [renameValue, setRenameValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRenameTeam = async () => {
    if (!selectedTeam || !renameValue.trim()) return;
    setIsSaving(true);
    setMessage(null);
    try {
      await reassignTeamOrders(selectedTeam, renameValue.trim());
      setMessage(`✅ Reassigned all orders from '${selectedTeam}' to '${renameValue.trim()}'.`);
      setRenameValue('');
      if (onTeamListChange) onTeamListChange();
    } catch (err: any) {
      setMessage(`❌ Error renaming team: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;
    if (!confirm(`Are you sure you want to remove team '${selectedTeam}'? All associated tickets will be reassigned to 'Unassigned' (no tickets will be deleted).`)) {
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      // HARD RULE ENFORCED: Reassign to Unassigned instead of deleting rows from Supabase
      await reassignTeamOrders(selectedTeam, 'Unassigned');
      setMessage(`✅ Reassigned all orders from '${selectedTeam}' to 'Unassigned'.`);
      if (onTeamListChange) onTeamListChange();
    } catch (err: any) {
      setMessage(`❌ Error deleting team: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Dispatch System Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-200">
            {message}
          </div>
        )}

        <div className="bg-amber-950/40 border border-amber-800/80 p-3 rounded text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <span>
            <strong>Data Protection Policy:</strong> Deleting a team automatically reassigns all historical orders to <em>Unassigned</em>. Service order records are never deleted.
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Select Team to Manage:</label>
            <select
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
            >
              {availableTeams.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-2">
            <label className="block text-slate-300 font-medium">Rename Team:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New team name..."
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={isSaving || !renameValue.trim()}
                onClick={handleRenameTeam}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded font-medium transition-colors"
              >
                Rename
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
            <span className="text-slate-400">Remove Team (Reassigns Orders):</span>
            <button
              type="button"
              disabled={isSaving || !selectedTeam}
              onClick={handleDeleteTeam}
              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded font-medium transition-colors"
            >
              Remove Team
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
