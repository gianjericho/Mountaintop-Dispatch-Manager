'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import { fetchServiceOrders, updateServiceOrder, insertServiceOrder } from '../lib/data/serviceOrders';
import { ServiceOrder } from '../lib/supabase/types';

export function useServiceOrders() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const query = useQuery({
    queryKey: ['service_orders'],
    queryFn: fetchServiceOrders,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Realtime channel subscription for instant UI updates
  useEffect(() => {
    const channel = supabase
      .channel('service_orders_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['service_orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, supabase]);

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ServiceOrder> }) =>
      updateServiceOrder(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service_orders'] });
    },
  });

  const insertMutation = useMutation({
    mutationFn: (order: Omit<ServiceOrder, 'id'> & { id?: string }) =>
      insertServiceOrder(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service_orders'] });
    },
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateOrder: updateMutation.mutateAsync,
    insertOrder: insertMutation.mutateAsync,
  };
}
