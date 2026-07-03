"use client";

import { useState } from 'react';
import { useDispatchData } from '@/context/DispatchContext';
import { dispatchService } from '@/services/dispatchService';
import { useToast } from '@/components/layout/ToastContainer';

interface TeamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamSettingsModal({ isOpen, onClose }: TeamSettingsModalProps) {
  const { teams, refreshData } = useDispatchData();
  const { addToast } = useToast();
  const [newTeam, setNewTeam] = useState('');

  if (!isOpen) return null;

  const handleAddTeam = () => {
    if (!newTeam.trim()) return;
    // In legacy, adding a team just appended it to the teams array. 
    // Since teams are derived from service_orders in Next.js, 
    // we can either add a dummy order or rely on the dispatch modal allowing free text.
    // For this mockup to work flawlessly, let's just trigger a toast that says "Use the New Dispatch modal to create a new team, or use the rename feature."
    addToast('To create a new team, just type a new name when creating a Dispatch.', 'info');
    setNewTeam('');
  };

  const handleRename = async (oldName: string) => {
    const newName = prompt(`Rename ${oldName} to:`);
    if (newName && newName !== oldName) {
      if (confirm(`Are you sure you want to rename ${oldName} to ${newName}? This will update all history.`)) {
        try {
          await dispatchService.renameTeam(oldName, newName);
          addToast('Team renamed successfully', 'success');
          refreshData();
        } catch (err) {
          addToast('Failed to rename team', 'error');
        }
      }
    }
  };

  const handleDelete = async (teamName: string) => {
    if (confirm(`Are you sure you want to DELETE the team ${teamName} and ALL its active/history records? This cannot be undone.`)) {
      try {
        await dispatchService.deleteTeam(teamName);
        addToast('Team and records deleted', 'success');
        refreshData();
      } catch (err) {
        addToast('Failed to delete team', 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm dark-element">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark-text">Manage Teams</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newTeam}
            onChange={e => setNewTeam(e.target.value)}
            placeholder="Add New Team..." 
            className="flex-1 border border-gray-300 rounded-lg p-2 text-xs outline-none dark-input" 
          />
          <button onClick={handleAddTeam} className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-xs transition flex items-center gap-1 hover:bg-blue-700">
            <i className="fa-solid fa-plus"></i> Add
          </button>
        </div>
        
        <p className="text-xs text-gray-400 mb-2 italic">Renaming updates history.</p>
        
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {teams.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">No teams found</div>
          ) : (
            teams.map(team => (
              <div key={team} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100 dark-bg-sub dark-border">
                <span className="text-sm font-bold text-gray-700 dark-text">{team}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleRename(team)} className="text-xs text-blue-500 hover:text-blue-700 bg-blue-100 px-2 py-1 rounded">Rename</button>
                  <button onClick={() => handleDelete(team)} className="text-xs text-red-500 hover:text-red-700 bg-red-100 px-2 py-1 rounded">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
