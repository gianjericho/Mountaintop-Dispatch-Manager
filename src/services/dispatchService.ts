import { supabase } from '@/lib/supabase';

export interface ServiceOrder {
  id?: number;
  name: string;
  team: string;
  area: string;
  barangay?: string;
  status: string;
  type: string;
  ticket?: string;
  account?: string;
  contact?: string;
  address?: string;
  trouble?: string;
  remarks?: string;
  tech_remarks?: string;
  longlat?: string;
  dateAdded?: string | null;
  dateDone?: string | null;
  [key: string]: any;
}

export const dispatchService = {
  async fetchAllOrders() {
    // In a real production app, we would paginate. 
    // Here we emulate the legacy behavior of fetching all relevant orders.
    const { data, error } = await supabase.from('service_orders').select('*').order('id', { ascending: false });
    if (error) throw error;
    return data as ServiceOrder[];
  },

  async saveOrder(payload: Partial<ServiceOrder>) {
    if (payload.id) {
      const { error } = await supabase.from('service_orders').update(payload).eq('id', payload.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('service_orders').insert([payload]);
      if (error) throw error;
    }
  },

  async saveBulkOrders(payloads: Partial<ServiceOrder>[]) {
    const { error } = await supabase.from('service_orders').insert(payloads);
    if (error) throw error;
  },

  async deleteOrder(id: number) {
    const { error } = await supabase.from('service_orders').delete().eq('id', id);
    if (error) throw error;
  },

  async dispatchOrder(id: number, status: string = 'active') {
    const dateAdded = new Date().toLocaleDateString('en-US');
    const { error } = await supabase.from('service_orders').update({
      status,
      dateAdded
    }).eq('id', id);
    if (error) throw error;
  },

  async rescheduleOrder(id: number) {
    const { error } = await supabase.from('service_orders').update({
      status: 'pending',
      dateAdded: null
    }).eq('id', id);
    if (error) throw error;
  },

  async markDone(id: number, tech_remarks: string) {
    const dateDone = new Date().toLocaleDateString('en-US');
    const { error } = await supabase.from('service_orders').update({
      status: 'done',
      tech_remarks,
      dateDone
    }).eq('id', id);
    if (error) throw error;
  },

  async updateField(id: number, field: string, value: any) {
    const { error } = await supabase.from('service_orders').update({ [field]: value }).eq('id', id);
    if (error) throw error;
  },

  async renameTeam(oldName: string, newName: string) {
    const { error } = await supabase.from('service_orders').update({ team: newName }).eq('team', oldName);
    if (error) throw error;
  },

  async deleteTeam(teamName: string) {
    const { error } = await supabase.from('service_orders').delete().eq('team', teamName);
    if (error) throw error;
  }
};
