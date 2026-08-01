import { describe, it, expect } from 'vitest';
import { parseSafeDate, isSameDay } from '../dates';
import { filterServiceOrders } from '../filters';
import { checkDuplicateKey } from '../duplicates';
import { canViewOrder, canEditOrder } from '../rbac';
import { calculatePerformanceStats } from '../performance';
import { getRepeatTroubleAccounts } from '../repeatTroubles';
import { ServiceOrder } from '../../supabase/types';

describe('Domain Logic Unit Tests', () => {
  describe('dates.ts', () => {
    it('parses YYYY-MM-DD correctly', () => {
      const d = parseSafeDate('2026-08-01');
      expect(d).not.toBeNull();
      expect(d?.getFullYear()).toBe(2026);
      expect(d?.getMonth()).toBe(7); // 0-indexed August
      expect(d?.getDate()).toBe(1);
    });

    it('parses MM/DD/YYYY correctly', () => {
      const d = parseSafeDate('8/1/2026');
      expect(d).not.toBeNull();
      expect(d?.getFullYear()).toBe(2026);
      expect(d?.getMonth()).toBe(7);
      expect(d?.getDate()).toBe(1);
    });

    it('identifies same days correctly', () => {
      const d1 = parseSafeDate('2026-08-01');
      const d2 = parseSafeDate('8/1/2026');
      expect(isSameDay(d1, d2)).toBe(true);
    });
  });

  describe('duplicates.ts', () => {
    const existing: ServiceOrder[] = [
      {
        id: '1',
        name: 'John Doe',
        team: 'Team A',
        area: 'TAGAYTAY',
        barangay: 'MAHALIN',
        status: 'pending',
        type: 'SLR',
        ticket_no: 'SF-1001',
        account_no: 'ACC-123',
        date_reported: '2026-08-01',
        is_processed: false
      }
    ];

    it('detects exact duplicate compound key', () => {
      const isDupe = checkDuplicateKey('SLR', 'SF-1001', 'ACC-123', '2026-08-01', existing);
      expect(isDupe).toBe(true);
    });

    it('allows different ticket or account numbers', () => {
      const isDupe = checkDuplicateKey('SLR', 'SF-1002', 'ACC-123', '2026-08-01', existing);
      expect(isDupe).toBe(false);
    });
  });

  describe('repeatTroubles.ts', () => {
    const orders: ServiceOrder[] = [
      { id: '1', name: 'User 1', team: 'A', area: 'X', barangay: 'Y', status: 'done', type: 'SLR', ticket_no: 'T1', account_no: 'ACC-999', date_reported: '2026-08-01', is_processed: false },
      { id: '2', name: 'User 1', team: 'A', area: 'X', barangay: 'Y', status: 'pending', type: 'SLR', ticket_no: 'T2', account_no: 'ACC-999', date_reported: '2026-08-10', is_processed: false }
    ];

    it('flags account with multiple tickets in 30 days as repeat trouble', () => {
      const repeats = getRepeatTroubleAccounts(orders, 30);
      expect(repeats.has('acc-999')).toBe(true);
    });
  });

  describe('rbac.ts', () => {
    const order: ServiceOrder = {
      id: '1',
      name: 'Jane Doe',
      team: 'ALPHA',
      area: 'AMADEO',
      barangay: 'POBLACION',
      status: 'active',
      type: 'SLR',
      ticket_no: 'SF-2002',
      account_no: 'ACC-456',
      is_processed: false
    };

    it('allows admin/developer to view any order', () => {
      expect(canViewOrder(order, { email: 'admin@slr.com', role: 'admin', team: null })).toBe(true);
    });

    it('restricts tech to their own team', () => {
      expect(canViewOrder(order, { email: 'tech@slr.com', role: 'tech', team: 'ALPHA' })).toBe(true);
      expect(canViewOrder(order, { email: 'tech@slr.com', role: 'tech', team: 'BETA' })).toBe(false);
    });
  });

  describe('performance.ts', () => {
    const orders: ServiceOrder[] = [
      { id: '1', name: 'A', team: 'ALPHA', area: 'X', barangay: 'Y', status: 'done', type: 'SLR', ticket_no: '1', account_no: '1', trouble_report: 'LOS', is_processed: false },
      { id: '2', name: 'B', team: 'ALPHA', area: 'X', barangay: 'Y', status: 'active', type: 'SLR', ticket_no: '2', account_no: '2', trouble_report: 'NO POWER', is_processed: false }
    ];

    it('calculates efficiency and team stats correctly', () => {
      const stats = calculatePerformanceStats(orders, null, null);
      expect(stats.totalDispatched).toBe(2);
      expect(stats.totalResolved).toBe(1);
      expect(stats.efficiencyRate).toBe(50);
      expect(stats.teamStats['ALPHA'].efficiency).toBe(50);
    });
  });
});
