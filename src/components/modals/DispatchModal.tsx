"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DispatchModal({ isOpen, onClose }: DispatchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">New Dispatch</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subscriber Name <span className="text-red-500">*</span></label>
            <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 outline-none transition" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Area <span className="text-red-500">*</span></label>
              <select className="w-full border border-gray-300 rounded-lg p-2.5 bg-white outline-none"></select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Barangay <span className="text-red-500">*</span></label>
              <select className="w-full border border-gray-300 rounded-lg p-2.5 bg-white outline-none">
                <option value="" disabled selected>Select Area First</option>
              </select>
            </div>
          </div>

          <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-green-700 transition mt-2">
            Confirm Dispatch
          </button>
        </div>
      </div>
    </div>
  );
}
