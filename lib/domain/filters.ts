import { ServiceOrder, AppMode } from '../supabase/types';
import { parseSafeDate, isSameDay } from './dates';

export interface FilterState {
  appMode: AppMode;
  searchField: string; // 'all' | 'name' | 'ticket_no' | 'account_no' | 'address' | 'trouble_report'
  searchQuery: string;
  teamFilter: string;
  areaFilter: string;
  barangayFilter: string;
  dateFilter: string; // YYYY-MM-DD
  todayOnly: boolean;
}

export function filterServiceOrders(
  orders: ServiceOrder[],
  filters: FilterState,
  userRole?: string,
  userTeam?: string | null
): ServiceOrder[] {
  return orders.filter(order => {
    // 1. App Mode filter (SLR vs SLI)
    if (order.type !== filters.appMode) return false;

    // 2. Tech Role Team Restriction
    if (userRole === 'tech' && userTeam) {
      if ((order.team || '').trim().toLowerCase() !== userTeam.trim().toLowerCase()) {
        return false;
      }
    }

    // 3. Team Filter (dropdown selector)
    if (filters.teamFilter && filters.teamFilter !== 'all') {
      if ((order.team || '').trim().toLowerCase() !== filters.teamFilter.trim().toLowerCase()) {
        return false;
      }
    }

    // 4. Area Filter (Municipality)
    if (filters.areaFilter && filters.areaFilter !== 'all') {
      if ((order.area || '').trim().toUpperCase() !== filters.areaFilter.trim().toUpperCase()) {
        return false;
      }
    }

    // 5. Barangay Filter
    if (filters.barangayFilter && filters.barangayFilter !== 'all') {
      if ((order.barangay || '').trim().toUpperCase() !== filters.barangayFilter.trim().toUpperCase()) {
        return false;
      }
    }

    // 6. Date Filter (Specific date selection)
    if (filters.dateFilter) {
      const filterDate = parseSafeDate(filters.dateFilter);
      const orderDate = parseSafeDate(order.dateAdded || order.date_reported);
      if (!isSameDay(filterDate, orderDate)) return false;
    }

    // 7. Today Only filter for tech users
    if (filters.todayOnly) {
      const today = new Date();
      const orderDate = parseSafeDate(order.dateAdded || order.date_reported);
      if (!isSameDay(today, orderDate)) return false;
    }

    // 8. Text Search Filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();

      if (filters.searchField === 'name') {
        if (!(order.name || '').toLowerCase().includes(q)) return false;
      } else if (filters.searchField === 'ticket_no') {
        if (!(order.ticket_no || '').toLowerCase().includes(q)) return false;
      } else if (filters.searchField === 'account_no') {
        if (!(order.account_no || '').toLowerCase().includes(q)) return false;
      } else if (filters.searchField === 'address') {
        if (!(order.address || '').toLowerCase().includes(q)) return false;
      } else if (filters.searchField === 'trouble_report') {
        if (!(order.trouble_report || '').toLowerCase().includes(q)) return false;
      } else {
        // 'all' fields search
        const haystack = [
          order.name,
          order.ticket_no,
          order.account_no,
          order.address,
          order.trouble_report,
          order.barangay,
          order.area,
          order.team
        ].filter(Boolean).join(' ').toLowerCase();

        if (!haystack.includes(q)) return false;
      }
    }

    return true;
  });
}
