import { ServiceOrder, UserRole } from '../supabase/types';

export interface UserContext {
  email: string;
  role: UserRole;
  team: string | null;
  isImpersonating?: boolean;
}

export function canViewOrder(order: ServiceOrder, user: UserContext | null): boolean {
  if (!user) return false;
  if (user.role === 'developer' || user.role === 'admin') return true;

  // Tech users can only view active or done tickets matching their team
  if (user.role === 'tech') {
    if (!user.team) return false;
    return (order.team || '').trim().toLowerCase() === user.team.trim().toLowerCase();
  }

  return false;
}

export function canEditOrder(order: ServiceOrder, user: UserContext | null): boolean {
  if (!user) return false;
  if (user.role === 'developer' || user.role === 'admin') return true;

  // Tech users can edit checklists and tech_remarks on active tickets assigned to their team
  if (user.role === 'tech') {
    if (!user.team) return false;
    return (
      order.status === 'active' &&
      (order.team || '').trim().toLowerCase() === user.team.trim().toLowerCase()
    );
  }

  return false;
}

export function canApproveOrder(user: UserContext | null): boolean {
  if (!user) return false;
  return user.role === 'developer' || user.role === 'admin';
}

export function canManageSettings(user: UserContext | null): boolean {
  if (!user) return false;
  return user.role === 'developer' || user.role === 'admin';
}
