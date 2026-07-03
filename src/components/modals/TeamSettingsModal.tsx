"use client";

import { X, Plus } from 'lucide-react';

interface TeamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamSettingsModal({ isOpen, onClose }: TeamSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Manage Teams</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <X size={20} />
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          <input type="text" placeholder="Add New Team..." className="flex-1 border border-gray-300 rounded-lg p-2 text-xs outline-none" />
          <button className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-xs transition flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-2 italic">Renaming updates history.</p>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {/* Team list placeholder */}
          <div className="text-center py-4 text-gray-400 text-sm">Teams will be listed here</div>
        </div>
      </div>
    </div>
  );
}
