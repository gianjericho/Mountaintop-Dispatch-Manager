"use client";

import { useAuth } from '@/components/auth/AuthProvider';
import LoginScreen from '@/components/auth/LoginScreen';
import { Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Tabs from '@/components/layout/Tabs';
import ListView from '@/components/views/ListView';
import PerformanceView from '@/components/views/PerformanceView';
import { useState } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [appMode, setAppMode] = useState('SLR');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <main>
      <Header appMode={appMode} setAppMode={setAppMode} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="max-w-lg mx-auto p-4">
        <ListView activeTab={activeTab} appMode={appMode} />
        <PerformanceView activeTab={activeTab} />
      </div>
    </main>
  );
}
