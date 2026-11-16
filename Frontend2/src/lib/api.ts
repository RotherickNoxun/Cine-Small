import axios from 'axios';
import { realtimeHub } from './signalr';
import {
  generateNextOrderId,
  loadAdminNotifications,
  loadCategories,
  loadOrders,
  loadProducts,
  loadStoreSettings,
  resetAllDemoStorage,
  saveAdminNotifications,
  saveCategories,
  saveOrders,
  saveProducts,
  saveStoreSettings,
} from './storage';
import type {
  AdminNotification,
  CategoryItem,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  StoreSettings,
} from '@/types/ecommerce';

export const adminHttpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 6000,
});

// ---- PEDIDOS ----

export async function fetchOrders(): Promise<Order[]> {
  return loadOrders();
}

export async function approveOrderPayment(orderId: string): Promise<Order> {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) throw new Error('Pedido no encontrado');

  const updated: Order = {
    ...orders[idx],
    paymentStatus: 'PAGADO',
    orderStatus:
      orders[idx].orderStatus === 'ENVIADO_COMPLETADO'
        ? 'ENVIADO_COMPLETADO'
        : 'VERIFICADO',
    rejectionReason: undefined,
  };

  orders[idx] = updated;
  saveOrders(orders);
  markOrderNotificationsAsRead(orderId);
  realtimeHub.emit('ORDER_UPDATED', orderId);
  return updated;
}

export async function rejectOrderPayment(payload: {
  orderId: string;
  reason?: string;
}): Promise<Order> {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === payload.orderId);
  if (idx === -1) throw new Error('Pedido no encontrado');

  const updated: Order = {
    ...orders[idx],
    paymentStatus: 'RECHAZADO',
    orderStatus: 'PENDIENTE',
    rejectionReason: payload.reason?.trim() || undefined,
  };

  orders[idx] = updated;
  saveOrders(orders);
  markOrderNotificationsAsRead(payload.orderId);
  realtimeHub.emit('ORDER_UPDATED', payload.orderId);
  return updated;
}

export async function updateOrderWorkflowStatus(payload: {
  orderId: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}): Promise<Order> {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === payload.orderId);
  if (idx === -1) throw new Error('Pedido no encontrado');

  const updated: Order = {
    ...orders[idx],
    orderStatus: payload.orderStatus ?? orders[idx].orderStatus,
    paymentStatus: payload.paymentStatus ?? orders[idx].paymentStatus,
  };

  orders[idx] = updated;
  saveOrders(orders);
  realtimeHub.emit('ORDER_UPDATED', payload.orderId);
  return updated;
}

export async function attachReceiptAndNotify(payload: {
  orderId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  previewUrl: string;
}): Promise<Order> {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === payload.orderId);
  if (idx === -1) throw new Error('Pedido no encontrado');

  const updated: Order = {
    ...orders[idx],
    paymentStatus: 'COMPROBANTE_ENVIADO',
    rejectionReason: undefined,
    receipt: {
      fileName: payload.fileName,
      fileType: payload.fileType,
      fileSize: payload.fileSize,
      previewUrl: payload.previewUrl,
      uploadedAt: new Date().toISOString(),
    },
  };

  orders[idx] = updated;
  saveOrders(orders);

  pushAdminNotification({
    id: `notif-${Date.now()}`,
    orderId: updated.id,
    title: `Nuevo comprobante recibido en ${updated.id}`,
    message: `${updated.customerName} adjuntó ${payload.fileName} para verificación QR.`,
    kind: 'RECEIPT',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  realtimeHub.emit('RECEIPT_UPLOADED', updated.id);
  return updated;
}

export async function simulateIncomingOrderWithReceipt(): Promise<Order> {
  const orders = loadOrders();
  const products = loadProducts();
  const selected = products[0];
  const nextId = generateNextOrderId(orders);

  const svgVoucher = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <rect width="600" height="380" fill="#F8FAFC"/>
    <rect x="24" y="24" width="552" height="332" rx="16" fill="#FFFFFF" stroke="#F59E0B" stroke-width="2.5"/>
    <rect x="24" y="24" width="552" height="60" rx="16" fill="#0A192F"/>
    <text x="300" y="61" text-anchor="middle" fill="#D4AF37" font-family="sans-serif" font-size="16" font-weight="800">PAGO QR RECIBIDO EN TIEMPO REAL</text>
    <text x="300" y="130" text-anchor="middle" fill="#0F172A" font-family="sans-serif" font-size="22" font-weight="800">${nextId}</text>
    <text x="300" y="168" text-anchor="middle" fill="#F59E0B" font-family="sans-serif" font-size="18" font-weight="700">Bs. ${(selected?.price ?? 350).toFixed(2)} · EN REVISIÓN</text>
    <text x="300" y="220" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="14">Cliente: Alejandro Vargas Salgado · Cel: 75019283</text>
    <text x="300" y="256" text-anchor="middle" fill="#64748B" font-family="sans-serif" font-size="13">Comprobante enviado desde Tienda Pública cinesmall.com</text>
  </svg>`;

  const created: Order = {
    id: nextId,
    createdAt: new Date().toISOString(),
    customerName: 'Alejandro Vargas Salgado',
    customerPhone: '75019283',
    address: 'Complejo Cine Small · Sala VIP 2 (Turno Noche 20:30)',
    notes: 'Solicitud rápida de sala privada con verificación inmediata.',
    items: [
      {
        productId: selected?.id ?? 'prod-1',
        name:
          selected?.name ??
          'Alquiler de Sala de Cine Privada VIP (Hasta 12 Personas · 3 Horas)',
        type: selected?.type ?? 'SERVICIO',
        category: selected?.category ?? 'Alquileres',
        price: selected?.price ?? 350,
        quantity: 1,
        image: selected?.images[0] ?? '',
      },
    ],
    subtotal: selected?.price ?? 350,
    total: selected?.price ?? 350,
    paymentStatus: 'COMPROBANTE_ENVIADO',
    orderStatus: 'PENDIENTE',
    receipt: {
      fileName: `comprobante_${nextId.replace('#', '').toLowerCase()}.svg`,
      fileType: 'image/svg+xml',
      fileSize: 164200,
      previewUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgVoucher)}`,
      uploadedAt: new Date().toISOString(),
    },
  };

  const nextOrders = [created, ...orders];
  saveOrders(nextOrders);

  pushAdminNotification({
    id: `notif-${Date.now()}`,
    orderId: created.id,
    title: `Nuevo comprobante recibido en ${created.id}`,
    message: `${created.customerName} subió comprobante QR por Bs. ${created.total.toFixed(2)}.`,
    kind: 'RECEIPT',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  realtimeHub.emit('RECEIPT_UPLOADED', created.id);
  return created;
}

// ---- PRODUCTOS Y SERVICIOS ----

export async function fetchProducts(): Promise<Product[]> {
  return loadProducts();
}

export async function upsertProduct(product: Product): Promise<Product[]> {
  const current = loadProducts();
  const existsIdx = current.findIndex((p) => p.id === product.id);
  const next =
    existsIdx >= 0
      ? current.map((p) => (p.id === product.id ? product : p))
      : [product, ...current];
  saveProducts(next);
  realtimeHub.emit('PRODUCTS_UPDATED');
  return next;
}

export async function deleteProduct(productId: string): Promise<Product[]> {
  const next = loadProducts().filter((p) => p.id !== productId);
  saveProducts(next);
  realtimeHub.emit('PRODUCTS_UPDATED');
  return next;
}

// ---- CATEGORÍAS SIMPLES ----

export async function fetchCategories(): Promise<CategoryItem[]> {
  return loadCategories();
}

export async function createCategory(payload: {
  name: string;
  description: string;
  icon: string;
  tagline: string;
}): Promise<CategoryItem[]> {
  const current = loadCategories();
  const trimmed = payload.name.trim();
  if (
    current.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
  ) {
    throw new Error(`Ya existe una categoría llamada "${trimmed}"`);
  }

  const created: CategoryItem = {
    id: `cat-${Date.now()}`,
    name: trimmed,
    description:
      payload.description.trim() || `Artículos y soluciones de ${trimmed}.`,
    icon: payload.icon || 'solar:tag-bold-duotone',
    tagline: payload.tagline.trim() || 'Catálogo Cine Small',
    createdAt: new Date().toISOString(),
  };

  const next = [...current, created];
  saveCategories(next);
  realtimeHub.emit('CATEGORIES_UPDATED');
  return next;
}

export async function updateCategory(payload: {
  id: string;
  name: string;
  description: string;
  tagline: string;
  icon: string;
}): Promise<CategoryItem[]> {
  const current = loadCategories();
  const target = current.find((c) => c.id === payload.id);
  if (!target) throw new Error('Categoría no encontrada');

  const trimmedName = payload.name.trim();
  if (!trimmedName) throw new Error('El nombre de la categoría es obligatorio');

  const duplicate = current.some(
    (c) =>
      c.id !== payload.id &&
      c.name.toLowerCase() === trimmedName.toLowerCase()
  );
  if (duplicate) {
    throw new Error(`Ya existe otra categoría llamada "${trimmedName}"`);
  }

  const oldName = target.name;
  const nextCategories = current.map((c) =>
    c.id === payload.id
      ? {
          ...c,
          name: trimmedName,
          description: payload.description.trim() || c.description,
          tagline: payload.tagline.trim() || c.tagline,
          icon: payload.icon || c.icon,
        }
      : c
  );
  saveCategories(nextCategories);

  // Actualización en cascada en productos cuando se renombra la categoría
  if (oldName !== trimmedName) {
    const updatedProducts = loadProducts().map((p) =>
      p.category === oldName ? { ...p, category: trimmedName } : p
    );
    saveProducts(updatedProducts);
    realtimeHub.emit('PRODUCTS_UPDATED');
  }

  realtimeHub.emit('CATEGORIES_UPDATED');
  return nextCategories;
}

export async function deleteCategory(categoryId: string): Promise<CategoryItem[]> {
  const current = loadCategories();
  const next = current.filter((c) => c.id !== categoryId);
  saveCategories(next);
  realtimeHub.emit('CATEGORIES_UPDATED');
  return next;
}

// ---- CONFIGURACIÓN DE TIENDA Y QR ----

export async function fetchStoreSettings(): Promise<StoreSettings> {
  return loadStoreSettings();
}

export async function saveUpdatedStoreSettings(
  settings: StoreSettings
): Promise<StoreSettings> {
  const next: StoreSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  saveStoreSettings(next);
  realtimeHub.emit('SETTINGS_UPDATED');
  return next;
}

// ---- NOTIFICACIONES ----

export async function fetchAdminNotifications(): Promise<AdminNotification[]> {
  return loadAdminNotifications();
}

export function pushAdminNotification(notif: AdminNotification): void {
  const current = loadAdminNotifications();
  const next = [notif, ...current].slice(0, 25);
  saveAdminNotifications(next);
  realtimeHub.emit('NOTIFICATIONS_UPDATED', notif.orderId);
}

export function markOrderNotificationsAsRead(orderId?: string): void {
  const current = loadAdminNotifications();
  const next = current.map((n) =>
    !orderId || n.orderId === orderId ? { ...n, isRead: true } : n
  );
  saveAdminNotifications(next);
  realtimeHub.emit('NOTIFICATIONS_UPDATED');
}

export async function markAllNotificationsRead(): Promise<AdminNotification[]> {
  const next = loadAdminNotifications().map((n) => ({ ...n, isRead: true }));
  saveAdminNotifications(next);
  realtimeHub.emit('NOTIFICATIONS_UPDATED');
  return next;
}

export async function resetDemoEnvironment(): Promise<void> {
  resetAllDemoStorage();
  realtimeHub.emit('ORDER_UPDATED');
  realtimeHub.emit('PRODUCTS_UPDATED');
  realtimeHub.emit('CATEGORIES_UPDATED');
  realtimeHub.emit('SETTINGS_UPDATED');
  realtimeHub.emit('NOTIFICATIONS_UPDATED');
}

