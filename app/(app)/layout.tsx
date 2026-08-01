'use client';

import React, { useState, useEffect } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useServiceOrders } from '../../hooks/useServiceOrders';
import { Header } from '../../components/Header';
import { FilterBar } from '../../components/FilterBar';
import { DevImpersonationBar } from '../../components/DevImpersonationBar';
import { DispatchFormModal } from '../../components/modals/DispatchFormModal';
import { BulkDispatchModal } from '../../components/modals/BulkDispatchModal';
import { SettingsModal } from '../../components/modals/SettingsModal';
import { FilterState } from '../../lib/domain/filters';
import { AppMode, ServiceOrder } from '../../lib/supabase/types';
import { createClient } from '../../lib/supabase/client';
import { AppContextProvider } from './app-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, realUser, setImpersonation } = useCurrentUser();
  const { orders, isLoading, updateOrder, insertOrder } = useServiceOrders();

  const [appMode, setAppMode] = useState<AppMode>('SLR');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editOrderTarget, setEditOrderTarget] = useState<ServiceOrder | null>(null);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    appMode: 'SLR',
    searchField: 'all',
    searchQuery: '',
    teamFilter: 'all',
    areaFilter: 'all',
    barangayFilter: 'all',
    dateFilter: '',
    todayOnly: false,
  });

  useEffect(() => {
    const savedMode = localStorage.getItem('appMode') as AppMode;
    if (savedMode === 'SLR' || savedMode === 'SLI') {
      setAppMode(savedMode);
      setFilters(prev => ({ ...prev, appMode: savedMode }));
    }
  }, []);

  const handleAppModeChange = (mode: AppMode) => {
    setAppMode(mode);
    localStorage.setItem('appMode', mode);
    setFilters(prev => ({ ...prev, appMode: mode }));
  };

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      appMode,
      searchField: 'all',
      searchQuery: '',
      teamFilter: 'all',
      areaFilter: 'all',
      barangayFilter: 'all',
      dateFilter: '',
      todayOnly: false,
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Derive unique filter lists
  const availableTeams = Array.from(
    new Set(orders.map(o => o.team).filter(Boolean))
  ).sort();

  const availableAreas = Array.from(
    new Set(orders.map(o => o.area).filter(Boolean))
  ).sort();

  const availableBarangays = Array.from(
    new Set(
      orders
        .filter(o => filters.areaFilter === 'all' || o.area?.toUpperCase() === filters.areaFilter.toUpperCase())
        .map(o => o.barangay)
        .filter(Boolean)
    )
  ).sort();

  // Pending count for Inbox badge
  const pendingCount = orders.filter(o => o.type === appMode && o.status === 'pending').length;

  const isDeveloper = realUser?.role === 'developer';

  const contextValue = {
    orders,
    isLoading,
    appMode,
    user,
    filters,
    onUpdateOrder: async (id: string, updates: Partial<ServiceOrder>) => {
      return await updateOrder({ id, updates });
    },
    onInsertOrder: async (order: Omit<ServiceOrder, 'id'> & { id?: string }) => {
      return await insertOrder(order);
    },
    onEditClick: (order: ServiceOrder) => {
      setEditOrderTarget(order);
      setIsManualModalOpen(true);
    },
    availableTeams
  };

  return (
    <AppContextProvider value={contextValue}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Dev Impersonation Bar */}
        {isDeveloper && (
          <DevImpersonationBar
            currentRole={user?.role || 'developer'}
            currentTeam={user?.team || null}
            isImpersonating={user?.isImpersonating || false}
            onSetImpersonation={setImpersonation}
            availableTeams={availableTeams}
          />
        )}

        {/* Main Header */}
        <Header
          appMode={appMode}
          onAppModeChange={handleAppModeChange}
          user={user}
          pendingCount={pendingCount}
          onOpenManualModal={() => {
            setEditOrderTarget(null);
            setIsManualModalOpen(true);
          }}
          onOpenBulkModal={() => setIsBulkModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onSignOut={handleSignOut}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
          {/* Global Filter Bar */}
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            availableTeams={availableTeams}
            availableAreas={availableAreas}
            availableBarangays={availableBarangays}
            isTechRole={user?.role === 'tech'}
          />

          {/* Tab Route Content */}
          {children}
        </main>

        {/* Global Modals */}
        <DispatchFormModal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
          onSubmit={async (orderData) => {
            if (editOrderTarget) {
              await updateOrder({ id: editOrderTarget.id, updates: orderData });
            } else {
              await insertOrder(orderData);
            }
          }}
          existingOrders={orders}
          editOrder={editOrderTarget}
          appMode={appMode}
          availableTeams={availableTeams}
        />

        <BulkDispatchModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onBulkInsert={async (newOrders) => {
            for (const order of newOrders) {
              await insertOrder(order);
            }
          }}
          appMode={appMode}
          availableTeams={availableTeams}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          availableTeams={availableTeams}
        />
      </div>
    </AppContextProvider>
  );
}
