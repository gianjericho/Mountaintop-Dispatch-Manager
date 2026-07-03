"use client";

import { useEffect, useState } from 'react';
import { dispatchService, ServiceOrder } from '@/services/dispatchService';
import { useAuth } from '@/components/auth/AuthProvider';
import { Search, CalendarDays } from 'lucide-react';

export default function ListView({ activeTab, appMode }: { activeTab: string; appMode: string }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await dispatchService.fetchAllOrders();
        if (mounted) setOrders(data);
      } catch (error) {
        console.error("Error loading orders", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const filteredOrders = orders.filter(order => {
    if ((order.type || 'SLR') !== appMode) return false;
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'active') return order.status === 'active';
    if (activeTab === 'history') return order.status === 'done';
    return false;
  });

  if (activeTab === 'performance') return null;

  return (
    <div className="fade-in space-y-4">
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 space-y-3 dark-element dark-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-500">
            <Search className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-wider">Search & Filter</span>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="w-full text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-100 dark-input"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm dark-element dark-border">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase">{activeTab} Dispatches</h2>
          <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {filteredOrders.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-sm text-gray-500 mt-2">Loading...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No records found.</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-800">{order.name}</h3>
                  <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md">{order.ticket || 'No Ticket'}</span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>{order.area} - {order.barangay}</p>
                  <p className="text-xs font-bold text-gray-400 mt-1">Assigned to: {order.team}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
