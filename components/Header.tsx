'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppMode } from '../lib/supabase/types';
import { UserContext } from '../lib/domain/rbac';
import {
  Inbox,
  Send,
  History,
  TrendingUp,
  PlusCircle,
  Upload,
  Settings,
  LogOut,
  Moon,
  Sun,
  Shield,
  Layers
} from 'lucide-react';

interface HeaderProps {
  appMode: AppMode;
  onAppModeChange: (mode: AppMode) => void;
  user: UserContext | null;
  pendingCount: number;
  onOpenManualModal: () => void;
  onOpenBulkModal: () => void;
  onOpenSettingsModal: () => void;
  onSignOut: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({
  appMode,
  onAppModeChange,
  user,
  pendingCount,
  onOpenManualModal,
  onOpenBulkModal,
  onOpenSettingsModal,
  onSignOut,
  darkMode,
  onToggleDarkMode
}: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    ...(user?.role === 'admin' || user?.role === 'developer'
      ? [
          {
            href: '/inbox',
            label: 'Inbox',
            icon: Inbox,
            badge: pendingCount > 0 ? pendingCount : null
          }
        ]
      : []),
    { href: '/dispatched', label: 'Dispatched', icon: Send },
    { href: '/history', label: 'History', icon: History },
    { href: '/performance', label: 'Performance', icon: TrendingUp }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Mode Switcher */}
        <div className="flex items-center gap-4">
          <Link href="/dispatched" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow">
              M
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-base leading-tight">
                Mountaintop Dispatch
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">Field Dispatch Ecosystem</p>
            </div>
          </Link>

          {/* SLR vs SLI Mode Toggle */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => onAppModeChange('SLR')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                appMode === 'SLR'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SLR
            </button>
            <button
              onClick={() => onAppModeChange('SLI')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                appMode === 'SLI'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SLI
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800/80">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-slate-800 text-cyan-300 shadow border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Actions & Controls */}
        <div className="flex items-center gap-2">
          {(user?.role === 'admin' || user?.role === 'developer') && (
            <>
              <button
                onClick={onOpenManualModal}
                className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Manual Dispatch
              </button>
              <button
                onClick={onOpenBulkModal}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Bulk Paste
              </button>
              <button
                onClick={onOpenSettingsModal}
                className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={onToggleDarkMode}
            className="p-1.5 text-slate-400 hover:text-amber-300 bg-slate-800 border border-slate-700 rounded-lg transition-colors"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Role Badge */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
              <div className="hidden sm:block text-right">
                <p className="text-slate-200 font-medium leading-none">{user.email.split('@')[0]}</p>
                <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                  {user.role} {user.team ? `(${user.team})` : ''}
                </p>
              </div>
              <button
                onClick={onSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
