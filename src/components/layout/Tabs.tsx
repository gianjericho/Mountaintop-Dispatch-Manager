"use client";

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  const tabs = [
    { id: 'pending', label: 'Inbox', badge: 0 },
    { id: 'active', label: 'Dispatched' },
    { id: 'history', label: 'History' },
    { id: 'performance', label: 'Performance' },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 flex mt-1 border-b border-gray-200 dark-border bg-white dark-element">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          id={`nav-${tab.id}`}
          className={`flex-1 py-3 text-center text-sm relative ${
            activeTab === tab.id ? 'nav-active' : 'nav-item'
          }`}
        >
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span 
              id={`badge-${tab.id}`}
              className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full"
            >
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
