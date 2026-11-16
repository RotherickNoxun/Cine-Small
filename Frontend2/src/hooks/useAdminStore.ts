import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveOrderPayment,
  attachReceiptAndNotify,
  createCategory,
  deleteCategory,
  deleteProduct,
  fetchAdminNotifications,
  fetchCategories,
  fetchOrders,
  fetchProducts,
  fetchStoreSettings,
  markAllNotificationsRead,
  rejectOrderPayment,
  resetDemoEnvironment,
  saveUpdatedStoreSettings,
  simulateIncomingOrderWithReceipt,
  updateCategory,
  updateOrderWorkflowStatus,
  upsertProduct,
} from '@/lib/api';
import { realtimeHub } from '@/lib/signalr';
import type { OrderStatus, PaymentStatus, Product, StoreSettings } from '@/types/ecommerce';

export const ADMIN_QUERY_KEYS = {
  ORDERS: ['admin-orders'] as const,
  PRODUCTS: ['admin-products'] as const,
  CATEGORIES: ['admin-categories'] as const,
  SETTINGS: ['admin-settings'] as const,
  NOTIFICATIONS: ['admin-notifications'] as const,
};

export function useRealtimeAdminSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = realtimeHub.subscribe((event) => {
      if (
        event.type === 'ORDER_CREATED' ||
        event.type === 'ORDER_UPDATED' ||
        event.type === 'RECEIPT_UPLOADED'
      ) {
        queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.ORDERS });
        queryClient.invalidateQueries({
          queryKey: ADMIN_QUERY_KEYS.NOTIFICATIONS,
        });
      }
      if (event.type === 'PRODUCTS_UPDATED') {
        queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.PRODUCTS });
      }
      if (event.type === 'CATEGORIES_UPDATED') {
        queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.CATEGORIES });
      }
      if (event.type === 'SETTINGS_UPDATED') {
        queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.SETTINGS });
      }
      if (event.type === 'NOTIFICATIONS_UPDATED') {
        queryClient.invalidateQueries({
          queryKey: ADMIN_QUERY_KEYS.NOTIFICATIONS,
        });
      }
    });

    return unsubscribe;
  }, [queryClient]);
}

export function useOrders() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.ORDERS,
    queryFn: fetchOrders,
  });
}

export function useApproveOrderPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveOrderPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.NOTIFICATIONS });
    },
  });
}

export function useRejectOrderPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectOrderPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.NOTIFICATIONS });
    },
  });
}

export function useUpdateOrderWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      orderId: string;
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
    }) => updateOrderWorkflowStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.ORDERS });
    },
  });
}

export function useAttachOrderReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attachReceiptAndNotify,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.NOTIFICATIONS });
    },
  });
}

export function useSimulateIncomingReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: simulateIncomingOrderWithReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.NOTIFICATIONS });
    },
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.PRODUCTS,
    queryFn: fetchProducts,
  });
}

export function useUpsertProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: Product) => upsertProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.PRODUCTS });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.PRODUCTS });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.CATEGORIES,
    queryFn: fetchCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.CATEGORIES });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.CATEGORIES });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.PRODUCTS });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.CATEGORIES });
    },
  });
}

export function useStoreSettings() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.SETTINGS,
    queryFn: fetchStoreSettings,
  });
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: StoreSettings) => saveUpdatedStoreSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.SETTINGS });
    },
  });
}

export function useAdminNotifications() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.NOTIFICATIONS,
    queryFn: fetchAdminNotifications,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.NOTIFICATIONS });
    },
  });
}

export function useResetDemoEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetDemoEnvironment,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

