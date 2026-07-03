"use client";

import { X } from 'lucide-react';

interface BulkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkModal({ isOpen, onClose }: BulkModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Manual Bulk Dispatch</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center border border-dashed border-gray-300 rounded-xl mb-4 bg-gray-50">
          <p className="text-gray-400">Bulk Data Entry Table Placeholder</p>
        </div>

        <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition shrink-0 uppercase tracking-wide">
          Dispatch All Rows
        </button>
      </div>
    </div>
  );
}
