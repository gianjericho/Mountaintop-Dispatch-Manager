"use client";

import { useState } from 'react';
import { useDispatchData } from '@/context/DispatchContext';
import { dispatchService, ServiceOrder } from '@/services/dispatchService';
import { useToast } from '@/components/layout/ToastContainer';

interface BulkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BulkRow {
  id: string;
  name: string;
  barangay: string;
  ticket: string;
  account: string;
  contact: string;
  address: string;
  trouble: string;
  remarks: string;
}

export default function BulkModal({ isOpen, onClose }: BulkModalProps) {
  const { areas, teams, refreshData } = useDispatchData();
  const { addToast } = useToast();
  
  const [globalArea, setGlobalArea] = useState('');
  const [globalTeam, setGlobalTeam] = useState('');
  const [rows, setRows] = useState<BulkRow[]>([]);

  if (!isOpen) return null;

  const addRow = () => {
    setRows([...rows, {
      id: Math.random().toString(),
      name: '',
      barangay: '',
      ticket: '',
      account: '',
      contact: '',
      address: '',
      trouble: '',
      remarks: ''
    }]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof BulkRow, value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleDispatchAll = async () => {
    if (!globalArea || !globalTeam) {
      alert("Please select an Area and Assign Team at the top before dispatching.");
      return;
    }

    if (rows.length === 0) {
      alert("Please add at least one row.");
      return;
    }

    for (let r of rows) {
      if (!r.name || !r.barangay) {
        alert("All rows must have a Subscriber Name and Barangay.");
        return;
      }
    }

    const payloads: Partial<ServiceOrder>[] = rows.map(r => ({
      name: r.name,
      area: globalArea,
      barangay: r.barangay,
      team: globalTeam,
      ticket: r.ticket,
      account: r.account,
      contact: r.contact,
      address: r.address,
      trouble: r.trouble,
      remarks: r.remarks,
      status: 'pending',
      type: 'SLR'
    }));

    try {
      await dispatchService.saveBulkOrders(payloads);
      addToast(`Successfully dispatched ${rows.length} tickets`, 'success');
      setRows([]);
      setGlobalArea('');
      setGlobalTeam('');
      refreshData();
      onClose();
    } catch (err) {
      addToast('Failed to dispatch bulk orders', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] flex flex-col dark-element">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-xl font-bold text-gray-800 dark-text">
            <i className="fa-solid fa-list-check text-gray-500 mr-2"></i>Manual Bulk Dispatch
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3 mb-4 shrink-0 bg-gray-50 p-3 rounded-xl border border-gray-200 dark-bg-sub dark-border shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Area <span className="text-red-500">*</span></label>
            <select value={globalArea} onChange={e => setGlobalArea(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 dark-input">
              <option value="" disabled>Select</option>
              {Object.keys(areas).sort().map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign Team <span className="text-red-500">*</span></label>
            <select value={globalTeam} onChange={e => setGlobalTeam(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 dark-input">
              <option value="" disabled>Select</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={addRow} className="bg-white text-blue-600 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm border border-blue-200 hover:bg-blue-50 transition dark-input">
              <i className="fa-solid fa-plus mr-1"></i> Add Row
            </button>
            <p className="text-[10px] text-gray-400 italic">Tip: Barangay is typed per row below.</p>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-1 border border-gray-200 rounded-xl dark-border mb-4 no-scrollbar shadow-inner bg-white dark-bg-sub relative">
          {rows.length === 0 && (
            <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-gray-300 pointer-events-none text-2xl font-bold opacity-30 dark:opacity-10 z-0">
              You can paste data from Google Sheets here!
            </p>
          )}
          <table className="w-full text-left border-collapse min-w-[900px] relative z-10">
            <thead className="bg-gray-100 sticky top-0 z-20 dark-bg-sub shadow-sm">
              <tr>
                <th className="p-3 text-[10px] font-bold text-gray-500 uppercase border-b dark-border">Subscriber Name <span className="text-red-500">*</span></th>
                <th className="p-3 text-[10px] font-bold text-gray-500 uppercase border-b dark-border w-32">Barangay <span className="text-red-500">*</span></th>
                <th className="p-3 text-[10px] font-bold text-gray-500 uppercase border-b dark-border w-28">Ticket No.</th>
                <th className="p-3 text-[10px] font-bold text-gray-500 uppercase border-b dark-border w-28">Account No.</th>
                <th className="p-3 text-[10px] font-bold text-gray-500 uppercase border-b dark-border w-28">Contact</th>
                <th className="p-3 text-[10px] font-bold text-gray-500 uppercase border-b dark-border">Address</th>
                <th className="p-3 text-[10px] font-bold text-gray-500 uppercase border-b dark-border">Trouble</th>
                <th className="p-3 text-[10px] font-bold text-gray-500 uppercase border-b dark-border">Remarks</th>
                <th className="p-3 text-[10px] font-bold text-gray-500 uppercase border-b dark-border w-10 text-center">X</th>
              </tr>
            </thead>
            <tbody className="bg-transparent">
              {rows.map(row => (
                <tr key={row.id}>
                  <td className="p-1"><input type="text" value={row.name} onChange={e => updateRow(row.id, 'name', e.target.value)} className="w-full text-xs p-1 outline-none border border-gray-200 dark-input" /></td>
                  <td className="p-1"><input type="text" value={row.barangay} onChange={e => updateRow(row.id, 'barangay', e.target.value)} className="w-full text-xs p-1 outline-none border border-gray-200 dark-input" /></td>
                  <td className="p-1"><input type="text" value={row.ticket} onChange={e => updateRow(row.id, 'ticket', e.target.value)} className="w-full text-xs p-1 outline-none border border-gray-200 dark-input" /></td>
                  <td className="p-1"><input type="text" value={row.account} onChange={e => updateRow(row.id, 'account', e.target.value)} className="w-full text-xs p-1 outline-none border border-gray-200 dark-input" /></td>
                  <td className="p-1"><input type="text" value={row.contact} onChange={e => updateRow(row.id, 'contact', e.target.value)} className="w-full text-xs p-1 outline-none border border-gray-200 dark-input" /></td>
                  <td className="p-1"><input type="text" value={row.address} onChange={e => updateRow(row.id, 'address', e.target.value)} className="w-full text-xs p-1 outline-none border border-gray-200 dark-input" /></td>
                  <td className="p-1"><input type="text" value={row.trouble} onChange={e => updateRow(row.id, 'trouble', e.target.value)} className="w-full text-xs p-1 outline-none border border-gray-200 dark-input" /></td>
                  <td className="p-1"><input type="text" value={row.remarks} onChange={e => updateRow(row.id, 'remarks', e.target.value)} className="w-full text-xs p-1 outline-none border border-gray-200 dark-input" /></td>
                  <td className="p-1 text-center"><button onClick={() => removeRow(row.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><i className="fa-solid fa-times"></i></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={handleDispatchAll} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition shrink-0 uppercase tracking-wide">
          Dispatch All Rows
        </button>
      </div>
    </div>
  );
}
