import { ServiceOrder } from '../supabase/types';

export function normalizeKey(val: string | null | undefined): string {
  if (!val) return '';
  return val.trim().toLowerCase().replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').replace(/^'/, '');
}

/**
 * Checks if an SLR or SLI ticket collides with an existing record.
 * Compound key matching Database unique index: (type, ticket_no, account_no, date_reported)
 */
export function checkDuplicateKey(
  type: 'SLR' | 'SLI',
  ticketNo: string,
  accountNo: string,
  dateReported: string,
  existingOrders: ServiceOrder[],
  excludeOrderId?: string
): boolean {
  const normType = type;
  const normTicket = normalizeKey(ticketNo);
  const normAccount = normalizeKey(accountNo);
  const normDate = normalizeKey(dateReported);

  if (!normTicket || !normAccount) return false;

  return existingOrders.some(order => {
    if (excludeOrderId && order.id === excludeOrderId) return false;
    if (order.type !== normType) return false;

    return (
      normalizeKey(order.ticket_no) === normTicket &&
      normalizeKey(order.account_no) === normAccount &&
      normalizeKey(order.date_reported) === normDate
    );
  });
}
