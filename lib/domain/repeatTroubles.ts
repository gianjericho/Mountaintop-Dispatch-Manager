import { ServiceOrder } from '../supabase/types';
import { parseSafeDate } from './dates';
import { normalizeKey } from './duplicates';

export interface RepeatAccountInfo {
  accountNo: string;
  ticketCount: number;
  orders: ServiceOrder[];
}

/**
 * Returns a Set of account numbers that have 2 or more tickets within a rolling 30-day window.
 */
export function getRepeatTroubleAccounts(orders: ServiceOrder[], windowDays: number = 30): Set<string> {
  const accountMap: { [acc: string]: ServiceOrder[] } = {};

  orders.forEach(order => {
    const acc = normalizeKey(order.account_no);
    if (!acc) return;
    if (!accountMap[acc]) accountMap[acc] = [];
    accountMap[acc].push(order);
  });

  const repeatSet = new Set<string>();

  Object.keys(accountMap).forEach(acc => {
    const accOrders = accountMap[acc];
    if (accOrders.length < 2) return;

    // Sort by date
    const dates = accOrders
      .map(o => parseSafeDate(o.date_reported || o.dateAdded))
      .filter(Boolean) as Date[];

    if (dates.length < 2) return;

    dates.sort((a, b) => b.getTime() - a.getTime());

    // Check if any two consecutive tickets are within windowDays
    for (let i = 0; i < dates.length - 1; i++) {
      const diffDays = (dates[i].getTime() - dates[i + 1].getTime()) / (1000 * 3600 * 24);
      if (diffDays <= windowDays) {
        repeatSet.add(acc);
        break;
      }
    }
  });

  return repeatSet;
}
