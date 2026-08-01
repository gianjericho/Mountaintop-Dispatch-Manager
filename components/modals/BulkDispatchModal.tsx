'use client';

import React, { useState } from 'react';
import { ServiceOrder, AppMode } from '../../lib/supabase/types';
import { X, Upload, AlertCircle } from 'lucide-react';

interface BulkDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkInsert: (orders: (Omit<ServiceOrder, 'id'> & { id?: string })[]) => Promise<void>;
  appMode: AppMode;
  availableTeams: string[];
}

export function BulkDispatchModal({
  isOpen,
  onClose,
  onBulkInsert,
  appMode,
  availableTeams
}: BulkDispatchModalProps) {
  const [pasteData, setPasteData] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('Unassigned');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessPaste = async () => {
    if (!pasteData.trim()) return;

    setIsProcessing(true);
    setParseError(null);

    try {
      const lines = pasteData.trim().split('\n');
      const newOrders: (Omit<ServiceOrder, 'id'> & { id?: string })[] = [];

      lines.forEach((line, index) => {
        const parts = line.split('\t').map(p => p.trim());
        if (parts.length < 3) return; // Need at least ticket, account, name

        // Auto-detect columns: ticket_no, account_no, name, area, barangay, trouble
        const ticket_no = parts[0] || '';
        const account_no = parts[1] || '';
        const name = parts[2] || '';
        const area = parts[3] || 'TAGAYTAY';
        const barangay = parts[4] || '';
        const trouble_report = parts[5] || '';
        const address = parts[6] || '';
        const contact_number = parts[7] || '';

        if (ticket_no && account_no && name) {
          newOrders.push({
            name,
            account_no,
            ticket_no,
            area,
            barangay,
            trouble_report,
            address,
            contact_number,
            team: selectedTeam,
            type: appMode,
            status: 'active', // Bulk dispatch pushes directly into active dispatched state
            dateAdded: new Date().toLocaleDateString('en-US'),
            date_reported: new Date().toLocaleDateString('en-US'),
            is_processed: false
          });
        }
      });

      if (newOrders.length === 0) {
        setParseError('Could not parse any valid ticket rows. Ensure TSV / tab-separated spreadsheet format.');
        setIsProcessing(false);
        return;
      }

      // Execute bulk insert (updating or adding without deleting existing rows)
      for (const order of newOrders) {
        await onBulkInsert([order]);
      }

      setPasteData('');
      onClose();
    } catch (err: any) {
      setParseError(`Failed to process bulk dispatch: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-400" />
            Bulk Spreadsheet Paste Dispatch ({appMode})
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
          <p className="font-semibold text-slate-300">Expected Tab-Separated Columns (Copy directly from Excel / Google Sheets):</p>
          <p className="font-mono text-cyan-400">
            [Ticket/JO No] &lt;tab&gt; [Account No] &lt;tab&gt; [Subscriber Name] &lt;tab&gt; [Area] &lt;tab&gt; [Barangay] &lt;tab&gt; [Trouble/Package]
          </p>
        </div>

        {parseError && (
          <div className="bg-rose-950/80 border border-rose-700 text-rose-200 text-xs p-3 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Assign All Pasted Tickets To Team:</label>
            <select
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
            >
              <option value="Unassigned">Unassigned</option>
              {availableTeams.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Paste Rows Here:</label>
            <textarea
              rows={8}
              placeholder="Paste tab-separated rows here..."
              value={pasteData}
              onChange={e => setPasteData(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded p-2.5 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing || !pasteData.trim()}
              onClick={handleProcessPaste}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded font-medium transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" /> Import Pasted Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
