"use client";

import { useAuth } from '@/components/auth/AuthProvider';
import { useDispatchData } from '@/context/DispatchContext';

export default function DevTools() {
  const { actualUser, user, setImpersonation } = useAuth();
  const { teams } = useDispatchData();

  if (!actualUser || actualUser.role !== 'developer') return null;

  const currentRole = user?.role || 'developer';
  const currentTeam = user?.team || '';

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value === 'developer' ? null : e.target.value;
    setImpersonation(role, role === 'tech' ? (teams[0] || 'Unassigned') : null);
  };

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setImpersonation('tech', e.target.value);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 text-white p-4 rounded-xl shadow-2xl z-50 border border-slate-700 w-64 transition-all">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        <i className="fa-solid fa-user-secret mr-1"></i> Dev Impersonator
      </h3>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] text-slate-400 mb-1">Simulate Role:</label>
          <select 
            value={currentRole}
            onChange={handleRoleChange}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-bold"
          >
            <option value="developer">Developer (Full Access)</option>
            <option value="admin">Admin (Dispatcher)</option>
            <option value="tech">Field Tech (Restricted)</option>
          </select>
        </div>
        
        {currentRole === 'tech' && (
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Simulate Team View:</label>
            <select 
              value={currentTeam}
              onChange={handleTeamChange}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-bold"
            >
              {teams.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
