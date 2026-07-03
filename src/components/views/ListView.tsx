"use client";

import { useDispatchData } from '@/context/DispatchContext';
import { useAuth } from '@/components/auth/AuthProvider';
import DispatchCard from '@/components/tickets/DispatchCard';
import { dispatchService, ServiceOrder } from '@/services/dispatchService';
import { useToast } from '@/components/layout/ToastContainer';

export default function ListView({ activeTab, appMode }: { activeTab: string; appMode: string }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const {
    orders, teams, areas, loading, refreshData,
    searchField, setSearchField, searchQuery, setSearchQuery,
    dateFilter, setDateFilter, teamFilter, setTeamFilter,
    areaFilter, setAreaFilter, barangayFilter, setBarangayFilter,
    sortBy, setSortBy, limit, setLimit, techDateMode, setTechDateMode,
    clearAllFilters
  } = useDispatchData();

  if (activeTab === 'performance') return null;

  // Filter Logic
  let filtered = orders.filter(order => {
    if ((order.type || 'SLR') !== appMode) return false;
    
    // Status Filter
    if (activeTab === 'pending' && order.status !== 'pending') return false;
    if (activeTab === 'active' && order.status !== 'active') return false;
    if (activeTab === 'history' && order.status !== 'done') return false;

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (searchField === 'name' && !order.name?.toLowerCase().includes(q)) return false;
      if (searchField === 'ticket' && !order.ticket?.toLowerCase().includes(q)) return false;
      if (searchField === 'account' && !order.account?.toLowerCase().includes(q)) return false;
    }

    // Role restrictions
    if (user?.role === 'tech') {
      if (order.team !== user.team) return false;
      if (techDateMode && activeTab === 'active') {
        const today = new Date().toLocaleDateString('en-US');
        if (order.dateAdded !== today) return false;
      }
    }

    // Global Filters
    if (dateFilter && order.dateAdded !== dateFilter) return false;
    if (teamFilter && order.team !== teamFilter) return false;
    if (areaFilter && order.area !== areaFilter) return false;
    if (barangayFilter && order.barangay !== barangayFilter) return false;

    return true;
  });

  // Sorting Logic
  filtered = filtered.sort((a, b) => {
    if (sortBy === 'aging') {
      const dateA = new Date(a.dateAdded || a.created_at).getTime();
      const dateB = new Date(b.dateAdded || b.created_at).getTime();
      return dateA - dateB;
    } else if (sortBy === 'date') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Newest first
    } else if (sortBy === 'dispatch') {
      const dateA = new Date(a.dateAdded || 0).getTime();
      const dateB = new Date(b.dateAdded || 0).getTime();
      return dateB - dateA;
    }
    return 0; // default (id descending)
  });

  const visibleOrders = filtered.slice(0, limit);
  const showMoreVisible = filtered.length > limit;

  const handleEdit = (order: ServiceOrder) => {
    // Open dispatch modal in edit mode (managed in a parent context or event usually)
    // For now, emit event since modals will listen
    window.dispatchEvent(new CustomEvent('open-dispatch-modal', { detail: order }));
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      try {
        await dispatchService.deleteOrder(id);
        addToast('Ticket deleted successfully', 'success');
        refreshData();
      } catch (err) {
        addToast('Failed to delete ticket', 'error');
      }
    }
  };

  const handleDispatch = async (id: number) => {
    try {
      await dispatchService.dispatchOrder(id);
      addToast('Ticket dispatched successfully', 'success');
      refreshData();
    } catch (err) {
      addToast('Failed to dispatch ticket', 'error');
    }
  };

  const handleReschedule = async (id: number) => {
    if (confirm("Reschedule this ticket? It will be sent back to Inbox.")) {
      try {
        await dispatchService.rescheduleOrder(id);
        addToast('Ticket rescheduled', 'success');
        refreshData();
      } catch (err) {
        addToast('Failed to reschedule', 'error');
      }
    }
  };

  const handleMarkDone = async (id: number) => {
    const remarks = prompt("Enter resolution remarks (Required):");
    if (remarks) {
      try {
        await dispatchService.markDone(id, remarks);
        addToast('Ticket resolved successfully', 'success');
        refreshData();
      } catch (err) {
        addToast('Failed to resolve ticket', 'error');
      }
    } else if (remarks !== null) {
      alert("Remarks are required to mark as done.");
    }
  };

  return (
    <div className="fade-in space-y-4">
      {/* Global Search and Filter Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-4 space-y-3 dark-element dark-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-500">
            <i className="fa-solid fa-magnifying-glass mr-2"></i>
            <span className="text-xs font-bold uppercase tracking-wider">Search & Filter</span>
          </div>
          <button 
            onClick={clearAllFilters}
            className={`${(searchQuery || dateFilter || teamFilter || areaFilter || barangayFilter) ? 'block' : 'hidden'} text-[10px] bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-full font-bold transition`}
          >
            RESET ALL
          </button>
        </div>

        <div className="flex gap-2 mb-2">
          <select 
            value={searchField} onChange={e => setSearchField(e.target.value)}
            className="w-1/3 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-100 dark-input cursor-pointer"
          >
            <option value="name">Name</option>
            <option value="ticket">Ticket / JO</option>
            <option value="account">Account No.</option>
          </select>
          <input 
            type="text" 
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-2/3 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-100 dark-input"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <input 
            type="date" 
            value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none dark-input"
          />
          <select 
            value={teamFilter} onChange={e => setTeamFilter(e.target.value)}
            className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none dark-input"
          >
            <option value="">All Teams</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select 
            value={areaFilter} onChange={e => { setAreaFilter(e.target.value); setBarangayFilter(''); }}
            className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none dark-input"
          >
            <option value="">All Areas</option>
            {Object.keys(areas).sort().map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select 
            value={barangayFilter} onChange={e => setBarangayFilter(e.target.value)}
            className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none dark-input"
            disabled={!areaFilter}
          >
            <option value="">All Barangays</option>
            {areaFilter && areas[areaFilter]?.sort().map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* List Header and Sort Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm dark-element dark-border">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase">{activeTab} Dispatches</h2>
          <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
          {user?.role === 'tech' && activeTab === 'active' && (
            <button 
              onClick={() => setTechDateMode(!techDateMode)}
              className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition"
            >
              <i className="fa-solid fa-calendar-day mr-1"></i>
              <span>{techDateMode ? 'Today Only' : 'All Time'}</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Sort</label>
          <select 
            value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold py-1 px-2 rounded outline-none focus:border-blue-500 cursor-pointer dark-input"
          >
            <option value="default">Default</option>
            <option value="aging">Aging Tickets</option>
            <option value="date">Sort by Date</option>
            <option value="dispatch">Sort by Dispatch Date</option>
          </select>
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Show</label>
          <select 
            value={limit} onChange={e => setLimit(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold py-1 px-2 rounded outline-none focus:border-blue-500 cursor-pointer dark-input"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-gray-400"></i>
          <p className="text-sm text-gray-500 mt-2">Loading...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No records found.</p>
            </div>
          ) : (
            visibleOrders.map(order => (
              <DispatchCard 
                key={order.id} 
                order={order} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDispatch={handleDispatch}
                onMarkDone={handleMarkDone}
                onReschedule={handleReschedule}
              />
            ))
          )}
          
          {showMoreVisible && (
            <button 
              onClick={() => setLimit(limit + 50)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold rounded-xl mt-4 text-sm transition"
            >
              Show More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
