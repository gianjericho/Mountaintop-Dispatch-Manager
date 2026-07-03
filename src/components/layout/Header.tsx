"use client";

import { useAuth } from '@/components/auth/AuthProvider';
import { useEffect, useState } from 'react';

interface HeaderProps {
  appMode: string;
  setAppMode: (mode: string) => void;
  onOpenBulk: () => void;
  onOpenNew: () => void;
  onOpenSettings: () => void;
}

export default function Header({ appMode, setAppMode, onOpenBulk, onOpenNew, onOpenSettings }: HeaderProps) {
  const { signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial preference
    if (document.body.classList.contains('dark-mode')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const isDark = document.body.classList.toggle('dark-mode');
    setIsDarkMode(isDark);
    if (isDark) {
      document.body.style.backgroundColor = '#0f172a'; // slate-900
    } else {
      document.body.style.backgroundColor = '#f1f5f9'; // slate-100
    }
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-40 dark-element transition-colors duration-300">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 bg-slate-100 dark-bg-sub p-1 rounded-lg transition-colors">
            <button
              onClick={() => setAppMode('SLR')}
              className={`px-4 py-1 rounded-md text-xs font-bold transition ${
                appMode === 'SLR' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'
              }`}
            >
              SLR
            </button>
            <button
              onClick={() => setAppMode('SLI')}
              className={`px-4 py-1 rounded-md text-xs font-bold transition ${
                appMode === 'SLI' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'
              }`}
            >
              SLI
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className="text-gray-400 hover:text-purple-500 p-1">
              <i className="fa-solid fa-moon text-lg"></i>
            </button>
            <button onClick={signOut} className="text-gray-400 hover:text-red-500 p-1">
              <i className="fa-solid fa-right-from-bracket text-lg"></i>
            </button>
            <button onClick={onOpenSettings} className="text-gray-400 hover:text-blue-600 p-1">
              <i className="fa-solid fa-gear text-lg"></i>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-lg font-extrabold text-slate-800 tracking-tight dark-text">
            {appMode} Dispatch
          </h1>
          <div className="flex gap-2">
            <button
              onClick={onOpenBulk}
              className="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-sm font-bold hover:bg-purple-200 transition border border-purple-200"
            >
              <i className="fa-solid fa-list-check mr-1"></i> Bulk
            </button>
            <button
              onClick={onOpenNew}
              className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-green-700 shadow-md shadow-green-600/30 transition"
            >
              + New
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
