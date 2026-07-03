"use client";

import { useState, useEffect } from 'react';
import { useDispatchData } from '@/context/DispatchContext';
import { dispatchService, ServiceOrder } from '@/services/dispatchService';
import { useToast } from '@/components/layout/ToastContainer';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit?: ServiceOrder | null;
}

export default function DispatchModal({ isOpen, onClose, orderToEdit }: DispatchModalProps) {
  const { areas, teams, refreshData } = useDispatchData();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [barangay, setBarangay] = useState('');
  const [team, setTeam] = useState('');
  const [ticket, setTicket] = useState('');
  const [account, setAccount] = useState('');
  const [contact, setContact] = useState('');
  const [facility, setFacility] = useState('');
  const [address, setAddress] = useState('');
  const [trouble, setTrouble] = useState('');
  const [remarks, setRemarks] = useState('');
  const [longlat, setLonglat] = useState('');

  useEffect(() => {
    if (orderToEdit) {
      setName(orderToEdit.name || '');
      setArea(orderToEdit.area || '');
      setBarangay(orderToEdit.barangay || '');
      setTeam(orderToEdit.team || '');
      setTicket(orderToEdit.ticket || '');
      setAccount(orderToEdit.account || '');
      setContact(orderToEdit.contact || '');
      setFacility(orderToEdit.facility || '');
      setAddress(orderToEdit.address || '');
      setTrouble(orderToEdit.trouble || '');
      setRemarks(orderToEdit.remarks || '');
      setLonglat(orderToEdit.longlat || '');
    } else {
      setName('');
      setArea('');
      setBarangay('');
      setTeam('');
      setTicket('');
      setAccount('');
      setContact('');
      setFacility('');
      setAddress('');
      setTrouble('');
      setRemarks('');
      setLonglat('');
    }
  }, [orderToEdit, isOpen]);

  const handleSubmit = async () => {
    if (!name || !area || !barangay || !team) {
      alert("Name, Area, Barangay, and Team are required.");
      return;
    }

    const payload: Partial<ServiceOrder> = {
      name, area, barangay, team, ticket, account, contact, facility, address, trouble, remarks, longlat,
      status: orderToEdit ? orderToEdit.status : 'pending',
      type: 'SLR'
    };

    if (orderToEdit) payload.id = orderToEdit.id;

    try {
      await dispatchService.saveOrder(payload);
      addToast(orderToEdit ? 'Ticket updated' : 'Ticket created', 'success');
      refreshData();
      onClose();
    } catch (err) {
      addToast('Failed to save ticket', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar dark-element">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark-text">{orderToEdit ? 'Edit Dispatch' : 'New Dispatch'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subscriber Name <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 outline-none transition dark-input" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Area <span className="text-red-500">*</span></label>
              <select value={area} onChange={e => { setArea(e.target.value); setBarangay(''); }} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white outline-none dark-input">
                <option value="" disabled>Select</option>
                {Object.keys(areas).sort().map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Barangay <span className="text-red-500">*</span></label>
              <select value={barangay} onChange={e => setBarangay(e.target.value)} disabled={!area} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white outline-none dark-input">
                <option value="" disabled>Select Area First</option>
                {area && areas[area]?.sort().map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign Team <span className="text-red-500">*</span></label>
            <select value={team} onChange={e => setTeam(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white outline-none dark-input">
              <option value="" disabled>Select</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="border-t border-gray-200 dark-border pt-3 mt-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Additional Details (Optional)</p>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input type="text" value={ticket} onChange={e => setTicket(e.target.value)} placeholder="Ticket No." className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 outline-none dark-input" />
              <input type="text" value={account} onChange={e => setAccount(e.target.value)} placeholder="Account No." className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 outline-none dark-input" />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder="Contact Number" className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 outline-none dark-input" />
              <input type="text" value={facility} onChange={e => setFacility(e.target.value)} placeholder="Facility (e.g. NAP)" className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 outline-none dark-input" />
            </div>

            <div className="mb-2">
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Complete Address" className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 outline-none dark-input" />
            </div>

            <div className="mb-2">
              <input type="text" value={trouble} onChange={e => setTrouble(e.target.value)} placeholder="Reported Trouble" className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 outline-none dark-input" />
            </div>

            <div className="mb-2">
              <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Dispatcher Remarks" className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 outline-none dark-input" />
            </div>

            <div>
              <input type="text" value={longlat} onChange={e => setLonglat(e.target.value)} placeholder="Long/Lat (e.g. 14.123, 120.456)" className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 outline-none dark-input" />
            </div>
          </div>

          <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-green-700 transition mt-2">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
