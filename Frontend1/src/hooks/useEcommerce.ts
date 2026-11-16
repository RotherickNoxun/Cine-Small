import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  attachOrderReceipt,
  createOrderRecord,
  deleteMovie,
  fetchMovies,
  fetchOrderById,
  fetchOrders,
  fetchProducts,
  reserveShowtimeSeats,
  submitContactMessage,
  updateOrderStatuses,
  upsertMovie,
  upsertProduct,
  type CreateOrderInput,
} from '@/lib/api';
import { realtimeHub } from '@/lib/signalr';
import type {
  ContactMessage,
  Movie,
  OrderReceipt,
  OrderStatus,
  PaymentStatus,
  Product,
} from '@/types/ecommerce';

export function useRealtimeQuerySync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = realtimeHub.subscribe((event) => {
      if (
        event.type === 'ORDER_CREATED' ||
        event.type === 'ORDER_UPDATED' ||
        event.type === 'RECEIPT_UPLOADED'
      ) {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        if (event.orderId) {
          queryClient.invalidateQueries({
            queryKey: ['order', event.orderId.replace(/^#/, '')],
          });
        } else {
          queryClient.invalidateQueries({ queryKey: ['order'] });
        }
      }
      if (event.type === 'PRODUCTS_UPDATED') {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
      if (event.type === 'MOVIES_UPDATED') {
        queryClient.invalidateQueries({ queryKey: ['movies'] });
      }
    });
    return unsubscribe;
  }, [queryClient]);
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 30,
  });
}

export function useUpsertProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: Product) => upsertProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      realtimeHub.emit('PRODUCTS_UPDATED');
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    staleTime: 1000 * 10,
  });
}

export function useOrder(orderId: string) {
  const cleanKey = orderId.replace(/^#/, '').toUpperCase();
  return useQuery({
    queryKey: ['order', cleanKey],
    queryFn: () => fetchOrderById(cleanKey),
    enabled: Boolean(cleanKey),
    staleTime: 1000 * 5,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrderRecord(input),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.setQueryData(['order', created.id.replace(/^#/, '')], created);
      realtimeHub.emit('ORDER_CREATED', created.id);
    },
  });
}

export function useUploadReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      receipt,
    }: {
      orderId: string;
      receipt: OrderReceipt;
    }) => attachOrderReceipt(orderId, receipt),
    onSuccess: (updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({
        queryKey: ['order', variables.orderId.replace(/^#/, '').toUpperCase()],
      });
      if (updated) {
        realtimeHub.emit('RECEIPT_UPLOADED', updated.id);
      }
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      paymentStatus,
      orderStatus,
    }: {
      orderId: string;
      paymentStatus?: PaymentStatus;
      orderStatus?: OrderStatus;
    }) => updateOrderStatuses(orderId, { paymentStatus, orderStatus }),
    onSuccess: (updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({
        queryKey: ['order', variables.orderId.replace(/^#/, '').toUpperCase()],
      });
      if (updated) {
        realtimeHub.emit('ORDER_UPDATED', updated.id);
      }
    },
  });
}

export function useSendContactMessage() {
  return useMutation({
    mutationFn: (payload: Omit<ContactMessage, 'id' | 'createdAt'>) =>
      submitContactMessage(payload),
  });
}


export function useMovies() {
  return useQuery({
    queryKey: ['movies'],
    queryFn: fetchMovies,
    staleTime: 1000 * 30,
  });
}

export function useUpsertMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (movie: Movie) => upsertMovie(movie),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      realtimeHub.emit('MOVIES_UPDATED');
    },
  });
}

export function useDeleteMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (movieId: string) => deleteMovie(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      realtimeHub.emit('MOVIES_UPDATED');
    },
  });
}

export function useReserveSeats() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      movieId,
      showtimeId,
      seats,
    }: {
      movieId: string;
      showtimeId: string;
      seats: string[];
    }) => reserveShowtimeSeats(movieId, showtimeId, seats),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      realtimeHub.emit('MOVIES_UPDATED');
    },
  });
}
