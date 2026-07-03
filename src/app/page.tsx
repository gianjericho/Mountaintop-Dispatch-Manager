"use client";

import { useAuth } from '@/components/auth/AuthProvider';
import LoginScreen from '@/components/auth/LoginScreen';
import Header from '@/components/layout/Header';
import Tabs from '@/components/layout/Tabs';
import ListView from '@/components/views/ListView';
import PerformanceView from '@/components/views/PerformanceView';
import DispatchModal from '@/components/modals/DispatchModal';
import BulkModal from '@/components/modals/BulkModal';
import TeamSettingsModal from '@/components/modals/TeamSettingsModal';
import TeamAnalyticsModal from '@/components/modals/TeamAnalyticsModal';
import { useState, useEffect } from 'react';
import { ServiceOrder } from '@/services/dispatchService';

export default function Home() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [appMode, setAppMode] = useState('SLR');

  // Modal States
  const [isDispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<ServiceOrder | null>(null);
  
  const [isBulkModalOpen, setBulkModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  
  const [isAnalyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [analyticsTeam, setAnalyticsTeam] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenDispatch = (e: Event) => {
      const customEvent = e as CustomEvent<ServiceOrder>;
      setOrderToEdit(customEvent.detail);
      setDispatchModalOpen(true);
    };

    const handleOpenAnalytics = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setAnalyticsTeam(customEvent.detail);
      setAnalyticsModalOpen(true);
    };

    window.addEventListener('open-dispatch-modal', handleOpenDispatch);
    window.addEventListener('open-team-analytics', handleOpenAnalytics);

    return () => {
      window.removeEventListener('open-dispatch-modal', handleOpenDispatch);
      window.removeEventListener('open-team-analytics', handleOpenAnalytics);
    };
  }, []);

  const handleOpenNewDispatch = () => {
    setOrderToEdit(null);
    setDispatchModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <main>
      <div className="bg-white shadow-sm sticky top-0 z-40 dark-element transition-colors duration-300">
        <Header 
          appMode={appMode} 
          setAppMode={setAppMode} 
          onOpenBulk={() => setBulkModalOpen(true)}
          onOpenNew={handleOpenNewDispatch}
          onOpenSettings={() => setSettingsModalOpen(true)}
        />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      <div className="max-w-lg mx-auto p-4">
        <ListView activeTab={activeTab} appMode={appMode} />
        <PerformanceView activeTab={activeTab} appMode={appMode} />
      </div>

      <DispatchModal 
        isOpen={isDispatchModalOpen} 
        onClose={() => setDispatchModalOpen(false)} 
        orderToEdit={orderToEdit}
      />
      
      <BulkModal 
        isOpen={isBulkModalOpen} 
        onClose={() => setBulkModalOpen(false)} 
      />

      <TeamSettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setSettingsModalOpen(false)} 
      />

      <TeamAnalyticsModal 
        isOpen={isAnalyticsModalOpen} 
        onClose={() => setAnalyticsModalOpen(false)} 
        team={analyticsTeam}
      />
    </main>
  );
}
