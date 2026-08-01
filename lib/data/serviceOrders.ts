import { createClient } from '../supabase/client';
import { ServiceOrder, SyncLog, ServiceOrderEvent } from '../supabase/types';

export async function fetchServiceOrders(): Promise<ServiceOrder[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('service_orders')
    .select('*')
    .order('date_reported', { ascending: false });

  if (error) {
    console.error('Error fetching service orders:', error);
    throw error;
  }

  return (data as ServiceOrder[]) || [];
}

export async function updateServiceOrder(
  id: string,
  updates: Partial<ServiceOrder>
): Promise<ServiceOrder> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('service_orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating service order ${id}:`, error);
    throw error;
  }

  return data as ServiceOrder;
}

export async function insertServiceOrder(
  order: Omit<ServiceOrder, 'id'> & { id?: string }
): Promise<ServiceOrder> {
  const supabase = createClient();
  const newId = order.id || crypto.randomUUID();

  const newOrder: ServiceOrder = {
    ...order,
    id: newId,
    is_processed: order.is_processed ?? false,
  };

  const { data, error } = await (supabase as any)
    .from('service_orders')
    .insert(newOrder)
    .select()
    .single();

  if (error) {
    console.error('Error inserting service order:', error);
    throw error;
  }

  return data as ServiceOrder;
}

export async function reassignTeamOrders(
  oldTeam: string,
  newTeam: string = 'Unassigned'
): Promise<void> {
  // HARD RULE: NEVER DELETE service_orders rows. Reassign instead!
  const supabase = createClient();
  const { error } = await (supabase as any)
    .from('service_orders')
    .update({ team: newTeam })
    .eq('team', oldTeam);

  if (error) {
    console.error(`Error reassigning team orders from ${oldTeam} to ${newTeam}:`, error);
    throw error;
  }
}

export async function fetchSyncLogs(): Promise<SyncLog[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('sync_log')
    .select('*')
    .order('ran_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching sync logs:', error);
    return [];
  }

  return (data as SyncLog[]) || [];
}

export async function fetchOrderEvents(orderId: string): Promise<ServiceOrderEvent[]> {
  const supabase = createClient();
  const { data, error } = await (supabase as any)
    .from('service_order_events')
    .select('*')
    .eq('order_id', orderId)
    .order('at', { ascending: false });

  if (error) {
    console.error(`Error fetching order events for ${orderId}:`, error);
    return [];
  }

  return (data as ServiceOrderEvent[]) || [];
}
