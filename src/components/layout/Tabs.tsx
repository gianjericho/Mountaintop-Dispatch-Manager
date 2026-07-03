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
          className={`flex-1 py-3 text-center text-sm relative transition-colors ${
            activeTab === tab.id
              ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
              : 'text-gray-500 hover:text-gray-700 font-medium'
          }`}
        >
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
