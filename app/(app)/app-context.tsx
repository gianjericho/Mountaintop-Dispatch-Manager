'use client';

import React, { createContext, useContext } from 'react';
import { ServiceOrder, AppMode } from '../../lib/supabase/types';
import { UserContext } from '../../lib/domain/rbac';
import { FilterState } from '../../lib/domain/filters';

interface AppContextType {
  orders: ServiceOrder[];
  isLoading: boolean;
  appMode: AppMode;
  user: UserContext | null;
  filters: FilterState;
  onUpdateOrder: (id: string, updates: Partial<ServiceOrder>) => Promise<any>;
  onInsertOrder: (order: Omit<ServiceOrder, 'id'> & { id?: string }) => Promise<any>;
  onEditClick: (order: ServiceOrder) => void;
  availableTeams: string[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppContextProvider({
  children,
  value
}: {
  children: React.ReactNode;
  value: AppContextType;
}) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return ctx;
}
