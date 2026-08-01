'use client';

import React from 'react';
import { FilterState } from '../lib/domain/filters';
import { Search, X, Calendar, Filter } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableTeams: string[];
  availableAreas: string[];
  availableBarangays: string[];
  isTechRole?: boolean;
}

export function FilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  availableTeams,
  availableAreas,
  availableBarangays,
  isTechRole = false
}: FilterBarProps) {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 mb-6 shadow-md space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Search Field Target */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Search Field</label>
          <select
            value={filters.searchField}
            onChange={e => onFilterChange({ searchField: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Fields</option>
            <option value="name">Name</option>
            <option value="ticket_no">Ticket / JO No.</option>
            <option value="account_no">Account No.</option>
            <option value="address">Address</option>
            <option value="trouble_report">Trouble / Package</option>
          </select>
        </div>

        {/* Free Text Search */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1">Search Query</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search tickets, names, accounts..."
              value={filters.searchQuery}
              onChange={e => onFilterChange({ searchQuery: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-8 py-2 focus:outline-none focus:border-cyan-500"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Team Filter */}
        {!isTechRole && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Team</label>
            <select
              value={filters.teamFilter}
              onChange={e => onFilterChange({ teamFilter: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Teams</option>
              {availableTeams.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}

        {/* Area / Municipality Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Area / Municipality</label>
          <select
            value={filters.areaFilter}
            onChange={e => onFilterChange({ areaFilter: e.target.value, barangayFilter: 'all' })}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Areas</option>
            {availableAreas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Barangay Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Barangay</label>
          <select
            value={filters.barangayFilter}
            onChange={e => onFilterChange({ barangayFilter: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Barangays</option>
            {availableBarangays.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.todayOnly}
              onChange={e => onFilterChange({ todayOnly: e.target.checked })}
              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
            />
            <span>Today Only</span>
          </label>

          <div className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <input
              type="date"
              value={filters.dateFilter}
              onChange={e => onFilterChange({ dateFilter: e.target.value })}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" /> Clear Filters
        </button>
      </div>
    </div>
  );
}
