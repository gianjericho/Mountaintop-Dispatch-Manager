'use client';

import React, { useState, useEffect } from 'react';
import { ServiceOrder, AppMode } from '../../lib/supabase/types';
import { checkDuplicateKey } from '../../lib/domain/duplicates';
import { X, AlertTriangle, Check } from 'lucide-react';

interface DispatchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: Omit<ServiceOrder, 'id'> & { id?: string }) => Promise<void>;
  existingOrders: ServiceOrder[];
  editOrder?: ServiceOrder | null;
  appMode: AppMode;
  availableTeams: string[];
}

export function DispatchFormModal({
  isOpen,
  onClose,
  onSubmit,
  existingOrders,
  editOrder,
  appMode,
  availableTeams
}: DispatchFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    account_no: '',
    ticket_no: '',
    area: 'TAGAYTAY',
    barangay: '',
    team: 'Unassigned',
    trouble_report: '',
    facility: '',
    contact_number: '',
    address: '',
    date_reported: new Date().toLocaleDateString('en-US')
  });

  const [dupeWarning, setDupeWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editOrder) {
      setFormData({
        name: editOrder.name || '',
        account_no: editOrder.account_no || '',
        ticket_no: editOrder.ticket_no || '',
        area: editOrder.area || 'TAGAYTAY',
        barangay: editOrder.barangay || '',
        team: editOrder.team || 'Unassigned',
        trouble_report: editOrder.trouble_report || '',
        facility: editOrder.facility || '',
        contact_number: editOrder.contact_number || '',
        address: editOrder.address || '',
        date_reported: editOrder.date_reported || new Date().toLocaleDateString('en-US')
      });
    } else {
      setFormData({
        name: '',
        account_no: '',
        ticket_no: '',
        area: 'TAGAYTAY',
        barangay: '',
        team: 'Unassigned',
        trouble_report: '',
        facility: '',
        contact_number: '',
        address: '',
        date_reported: new Date().toLocaleDateString('en-US')
      });
    }
  }, [editOrder, isOpen]);

  useEffect(() => {
    if (formData.ticket_no && formData.account_no) {
      const isDupe = checkDuplicateKey(
        appMode,
        formData.ticket_no,
        formData.account_no,
        formData.date_reported,
        existingOrders,
        editOrder?.id
      );
      setDupeWarning(isDupe ? '⚠️ Warning: A ticket with matching ticket, account, and date already exists!' : null);
    } else {
      setDupeWarning(null);
    }
  }, [formData.ticket_no, formData.account_no, formData.date_reported, appMode, existingOrders, editOrder]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.account_no || !formData.ticket_no) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: editOrder?.id,
        name: formData.name,
        account_no: formData.account_no,
        ticket_no: formData.ticket_no,
        area: formData.area,
        barangay: formData.barangay,
        team: formData.team,
        trouble_report: formData.trouble_report,
        facility: formData.facility,
        contact_number: formData.contact_number,
        address: formData.address,
        date_reported: formData.date_reported,
        type: appMode,
        status: editOrder?.status || 'pending',
        is_processed: editOrder?.is_processed || false
      });
      onClose();
    } catch (err) {
      console.error('Error submitting dispatch form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSLI = appMode === 'SLI';
  const ticketLabel = isSLI ? 'JO No.' : 'SF Ticket No.';
  const troubleLabel = isSLI ? 'Package Name' : 'Reported Trouble';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-semibold text-slate-100">
            {editOrder ? 'Edit Ticket' : `Manual Dispatch Entry (${appMode})`}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {dupeWarning && (
          <div className="bg-amber-950/90 border border-amber-700 text-amber-200 text-xs p-3 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{dupeWarning}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Subscriber Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Account Number *</label>
              <input
                type="text"
                required
                value={formData.account_no}
                onChange={e => setFormData({ ...formData, account_no: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">{ticketLabel} *</label>
              <input
                type="text"
                required
                value={formData.ticket_no}
                onChange={e => setFormData({ ...formData, ticket_no: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Assigned Team</label>
              <select
                value={formData.team}
                onChange={e => setFormData({ ...formData, team: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Unassigned">Unassigned</option>
                {availableTeams.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Area / Municipality</label>
              <input
                type="text"
                value={formData.area}
                onChange={e => setFormData({ ...formData, area: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Barangay</label>
              <input
                type="text"
                value={formData.barangay}
                onChange={e => setFormData({ ...formData, barangay: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">{troubleLabel}</label>
            <input
              type="text"
              value={formData.trouble_report}
              onChange={e => setFormData({ ...formData, trouble_report: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Contact Number</label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={e => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Facility / NAP</label>
              <input
                type="text"
                value={formData.facility}
                onChange={e => setFormData({ ...formData, facility: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
              />
            </div>
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
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Dispatch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
