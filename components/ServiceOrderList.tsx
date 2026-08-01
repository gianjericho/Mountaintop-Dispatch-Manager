'use client';

import React, { useState } from 'react';
import { ServiceOrder, AppMode } from '../lib/supabase/types';
import { UserContext } from '../lib/domain/rbac';
import { ServiceOrderCard } from './ServiceOrderCard';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

interface ServiceOrderListProps {
  orders: ServiceOrder[];
  appMode: AppMode;
  user: UserContext | null;
  isLoading?: boolean;
  onUpdateOrder: (id: string, updates: Partial<ServiceOrder>) => Promise<void>;
  onEditClick?: (order: ServiceOrder) => void;
  onApproveClick?: (order: ServiceOrder) => void;
  onRescheduleClick?: (order: ServiceOrder) => void;
}

const ITEMS_PER_PAGE = 25;

export function ServiceOrderList({
  orders,
  appMode,
  user,
  isLoading = false,
  onUpdateOrder,
  onEditClick,
  onApproveClick,
  onRescheduleClick
}: ServiceOrderListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 h-48 animate-pulse">
            <div className="h-5 bg-slate-700/60 rounded w-2/3 mb-3"></div>
            <div className="h-4 bg-slate-700/40 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-slate-700/40 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-slate-700/50 rounded w-full mt-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-12 text-center text-slate-400">
        <Inbox className="w-12 h-12 mx-auto text-slate-500 mb-3 opacity-80" />
        <h3 className="text-lg font-medium text-slate-300">No tickets found</h3>
        <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong>{startIndex + 1}</strong> – <strong>{Math.min(startIndex + ITEMS_PER_PAGE, orders.length)}</strong> of <strong>{orders.length}</strong> ticket(s)
        </span>
        <span>Page {safePage} of {totalPages}</span>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedOrders.map(order => (
          <ServiceOrderCard
            key={order.id}
            order={order}
            appMode={appMode}
            user={user}
            onUpdate={onUpdateOrder}
            onEditClick={onEditClick}
            onApproveClick={onApproveClick}
            onRescheduleClick={onRescheduleClick}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs text-slate-400 font-mono">
            {safePage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
